/**
 * GameController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


/**
 *  */ 

module.exports = {
  
    create:async (req,res)=>{
        var data = req.allParams();
        sails.log.warn("DATA",data);
        let game = await Game.findOne({id:data.game});
        var gameData = {
            game: null,
            level: data.level,
        };

        sails.log.warn(game,gameData);
        let rowGameData;
        try{
            rowGameData = await GameData.create(gameData).fetch();
            sails.log.warn("rowGameData",rowGameData);   

            await GameData.update({id:rowGameData.id},{game:game.id});
            sails.log.warn("rowGameData",rowGameData);  
            if(data.multiplechoicegamedata){
                var chooseIndex = {};
                var datamul = data.multiplechoicegamedata.map(v=>{
                    v.gamedata = rowGameData.id;
                    chooseIndex[v.number1+v.number2] = v.numberbooleanpair;
                    v.numberbooleanpair = [];
                    return v;
                });
                sails.log.warn(datamul,"INDEX ----------",chooseIndex);

                let multiple = await MultipleChoiceGameData.createEach(datamul).fetch();
                let multipleById = {};
                multiple.forEach((v)=>{
                    multipleById[v.number1+v.number2] = v.id;
                })
                sails.log.warn("MULTIPLE ID ",multipleById);
                let datOptions = [];
                Object.keys(chooseIndex).forEach(v=>{
                    let row = chooseIndex[v].map(op=>{
                        op.multiplechoicegamedata = multipleById[v];
                        return op;
                    });
                    datOptions = datOptions.concat(row);
                });
                sails.log.warn("------------ ",datOptions);
                await NumberBooleanPair.createEach(datOptions);
            }

            res.send( await GameData.findOne({id:rowGameData.id}).populateAll() );  
        }catch(e){
            return res.serverError(e);
        }
    }

};

