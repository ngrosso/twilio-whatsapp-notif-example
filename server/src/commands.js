module.exports = {
    hora : function(){
        console.log(users);
        let time = new Date().toLocaleTimeString();
        return { lastCommand: 'hora', commandStatus: -1, message: time}
    },
    ayuda : function(args){
        let text = 'mock ayuda';
        if(args != undefined){
            text += ' '+args;
        }
        return { lastCommand: 'ayuda', commandStatus: -1, message: text}
    },
    
    hola: function(args){
        console.log('Funcion hola:');
        console.log(args);
        if(args != undefined){
            if(args.user.commandStatus != undefined){
                switch(args.user.commandStatus){
                    case 1:
                        return { lastCommand: "hola", commandStatus: 2, userData : {nombre: args.msg }, message : "Hola "+args.msg + ". De que país sos?"};
                    case 2:
                        return { lastCommand: "hola", commandStatus: -1, userData : {nombre: args.user.userData.nombre , pais: args.msg }, message: "Registrado. tu nombre es: "+args.user.userData.nombre+" y sos de "+args.msg}
                }
            }
        }else{
            return { lastCommand: "hola", commandStatus : 1, message : "Hola. Cual es tu nombre?"}
        }
    }
}