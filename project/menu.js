const menu = require('./scripts/renderer');
const utils = require('./scripts/utils');
(function () {
    $('#Point').click(()=>{
        utils.clearCanvas();
        menu.PointScene();
    });

    $('#Circle').click(()=>{
        utils.clearCanvas();
        menu.CircleScene();
    });

    $('#BresenhamLine').click(()=>{
        utils.clearCanvas();
        menu.BresenhamLineScene();
    });

    $('#CohenSutherland').click(()=>{
        utils.clearCanvas();
        menu.CohenSutherlandScene();
    });

    $('#Triangle').click(()=>{
        utils.clearCanvas();
        menu.TriangleScene();
    });

    $('#Translate').click(()=>{
        utils.clearCanvas();
        menu.TranslateScene();
    });

    $('#Texture').click(()=>{
        utils.clearCanvas();
        menu.TextureScene();
    });

    $('#MipMap').click(()=>{
        utils.clearCanvas();
        menu.MipMapScene();
    });

    $('#Cube').click(()=>{
        utils.clearCanvas();
        menu.CubeScene();
    });
})()