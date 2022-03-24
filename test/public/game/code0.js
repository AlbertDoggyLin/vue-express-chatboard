gdjs.Untitled_32sceneCode = {};
gdjs.Untitled_32sceneCode.GDAxeObjects1= [];
gdjs.Untitled_32sceneCode.GDAxeObjects2= [];
gdjs.Untitled_32sceneCode.GDWallCornerFrontLeftObjects1= [];
gdjs.Untitled_32sceneCode.GDWallCornerFrontLeftObjects2= [];

gdjs.Untitled_32sceneCode.conditionTrue_0 = {val:false};
gdjs.Untitled_32sceneCode.condition0IsTrue_0 = {val:false};
gdjs.Untitled_32sceneCode.condition1IsTrue_0 = {val:false};


gdjs.Untitled_32sceneCode.mapOfGDgdjs_46Untitled_9532sceneCode_46GDAxeObjects1Objects = Hashtable.newFrom({"Axe": gdjs.Untitled_32sceneCode.GDAxeObjects1});gdjs.Untitled_32sceneCode.mapOfGDgdjs_46Untitled_9532sceneCode_46GDWallCornerFrontLeftObjects1Objects = Hashtable.newFrom({"WallCornerFrontLeft": gdjs.Untitled_32sceneCode.GDWallCornerFrontLeftObjects1});gdjs.Untitled_32sceneCode.eventsList0 = function(runtimeScene) {

{

gdjs.copyArray(runtimeScene.getObjects("Axe"), gdjs.Untitled_32sceneCode.GDAxeObjects1);
gdjs.copyArray(runtimeScene.getObjects("WallCornerFrontLeft"), gdjs.Untitled_32sceneCode.GDWallCornerFrontLeftObjects1);

gdjs.Untitled_32sceneCode.condition0IsTrue_0.val = false;
{
gdjs.Untitled_32sceneCode.condition0IsTrue_0.val = gdjs.evtTools.object.hitBoxesCollisionTest(gdjs.Untitled_32sceneCode.mapOfGDgdjs_46Untitled_9532sceneCode_46GDAxeObjects1Objects, gdjs.Untitled_32sceneCode.mapOfGDgdjs_46Untitled_9532sceneCode_46GDWallCornerFrontLeftObjects1Objects, false, runtimeScene, false);
}if (gdjs.Untitled_32sceneCode.condition0IsTrue_0.val) {
/* Reuse gdjs.Untitled_32sceneCode.GDWallCornerFrontLeftObjects1 */
{for(var i = 0, len = gdjs.Untitled_32sceneCode.GDWallCornerFrontLeftObjects1.length ;i < len;++i) {
    gdjs.Untitled_32sceneCode.GDWallCornerFrontLeftObjects1[i].deleteFromScene(runtimeScene);
}
}}

}


};

gdjs.Untitled_32sceneCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.Untitled_32sceneCode.GDAxeObjects1.length = 0;
gdjs.Untitled_32sceneCode.GDAxeObjects2.length = 0;
gdjs.Untitled_32sceneCode.GDWallCornerFrontLeftObjects1.length = 0;
gdjs.Untitled_32sceneCode.GDWallCornerFrontLeftObjects2.length = 0;

gdjs.Untitled_32sceneCode.eventsList0(runtimeScene);
return;

}

gdjs['Untitled_32sceneCode'] = gdjs.Untitled_32sceneCode;
