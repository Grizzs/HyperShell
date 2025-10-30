export function randomChooser(arrayToChoose){
    try{

        const choosenArt = arrayToChoose[Math.floor(Math.random() * arrayToChoose.length)];
        return choosenArt
    }
    catch (err){
        if(err instanceof TypeError) {
            console.error(`
                [Erro] Função randomChooser() recebeu tipo argumento ${typeof arrayToChoose} `)
        }
        return console.log('Deu ruim')
    }
    
}

