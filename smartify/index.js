const {parse} = require('querystring');
const got = require('got');
const accountSid = 'xxxx'; 
const authToken = 'xxxx'; 
const twilio = require('twilio')(accountSid, authToken)

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    body = parse(req.body);
    if (body.Memory) {
        m = JSON.parse(body.Memory)
        number = m.twilio.voice.From;
        stupid = m.twilio.collected_data.collectSmarter.answers.stupid.answer;
        smart = await smartify(stupid);
        twilio.messages.create({ 
            body: stupid + " -> " + smart, 
            from: '+16266584178',       
            to: number 
        })
        .then(message => console.log(message.sid)) 
        .done();
        context.res = {
            body: "ok"
        };
    }
    else {
        context.res = {
            status: 400,
            body: "nope"
        };
    }
};

async function smartify(input) {
    output = "";
    input = input.replace(".", "");
    tokens = input.split(" ");
    
    for( var i=0; i < tokens.length; i++) {
        word = tokens[i];     
        if (word.length > 3 && word.match('[\']') == null) {            
            word = await (async () => {
                const response = await got(`https://api.datamuse.com/words?ml=${word}`);                
                words = JSON.parse(response.body);
                for( var j=0; j < words.length; j++) {                    
                    word = words[j].word.length > word.length? words[j].word: word;                   
                }
                return word;
            })();
        }
        output = output + word + " ";
    }    
    return output;
}
