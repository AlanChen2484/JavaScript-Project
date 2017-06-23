Spacing=20;//每一格的间距，也即一个小方块的尺寸
Width=400;
Height=600;
//各种形状的编号，0代表没有形状，后面几种其实没用上
NoShape=0;
ZShape=1;
SShape=2;
LineShape=3;
TShape=4;
SquareShape=5;
LShape=6;
MirroredLShape=7
//各种形状的颜色
Colors=["Wheat","olive","chocolate","firebrick","Sienna","darkblue","green","red"];
//各种形状的数据描述
Shapes=[
[ [ 0, 0 ], [ 0, 0 ], [ 0, 0 ], [ 0, 0 ] ],
[ [ 0, -1 ], [ 0, 0 ], [ -1, 0 ], [ -1, 1 ] ],
[ [ 0, -1 ], [ 0, 0 ], [ 1, 0 ], [ 1, 1 ] ],
[ [ 0, -1 ], [ 0, 0 ], [ 0, 1 ], [ 0, 2 ] ],
[ [ -1, 0 ], [ 0, 0 ], [ 1, 0 ], [ 0, 1 ] ],
[ [ 0, 0 ], [ 1, 0 ], [ 0, 1 ], [ 1, 1 ] ],
[ [ -1, -1 ], [ 0, -1 ], [ 0, 0 ], [ 0, 1 ] ],
[ [ 1, -1 ], [ 0, -1 ], [ 0, 0 ], [ 0, 1 ] ]
];
var ctx=document.getElementById("myCanvas").getContext("2d");
ctx.strokeStyle="snow";
var frameIntv=null;//当前动画循环
var tIntv=null;
var frameRate=40;
var downRate=500;
var t;//俄罗斯方块
var score=0;//游戏得分
function drawBackground() {
ctx.strokeRect(0,0,Width,Height);
ctx.beginPath();
for (var i=0;i<=Width;)
{
ctx.lineTo(i,Height);
i += 20;
ctx.moveTo(i,0);
}
ctx.moveTo(0,0);
for (var j=0;j<=Height;)
{
ctx.lineTo(Width,j);
j += 20;
ctx.moveTo(0,j);
}
ctx.stroke();
ctx.closePath();
}
function init() {
drawBackground();
}
function drawGame() {
drawBackground();
drawMap();
drawTetris(t);
}
function playGame(s)
{
if (frameIntv)//如果frameIntv不为null，则代表我们当前已经有了一个动画
{
document.getElementById("bgAudio").pause();
clearInterval(tIntv);
clearInterval(frameIntv);//停止动画
frameIntv=null;
s.value="开始";
}
else
{
if (document.getElementById("bgMusicBtn").value=="开启")
{
document.getElementById("bgAudio").play();
}
if (t==null)
{
t=new Tetris();
}
tIntv=setInterval("t.tetrisDown()",downRate);
frameIntv=setInterval(drawGame,frameRate);
s.value="暂停";
}
}
function selectDifficulty(v)
{
if ("easy"==v)
{
downRate=500;
}
else if ("normal"==v)
{
downRate=250;
}
else if ("hard"==v)
{
downRate=100;
}
}
function bgMusicProcess()
{
if (document.getElementById("bgMusicBtn").value=="开启")
{
document.getElementById("bgAudio").pause();
document.getElementById("bgMusicBtn").value="关闭";
}
else if (document.getElementById("bgMusicBtn").value=="关闭")
{
document.getElementById("bgAudio").play();
document.getElementById("bgMusicBtn").value="开启";
}
}
//将形状自身的坐标系转换为 Map 的坐标系，row col 为当前形状原点在 Map 中的位置
function translateToMap(data,row,col,space){
var copy=[];
for(var i=0;i<4;i++){
var temp={};
temp.row=data[i][1]*space+row;
temp.col=data[i][0]*space+col;
copy.push(temp);
}
return copy;
}
/*
俄罗斯方块向右旋转辅助函数,实现Map中的坐标右旋
原始坐标为(x0,y0),右旋后坐标为(x0',y0')(其中x0'=y0,y0'=-x0)-----> (1)
原始坐标在Map中的坐标为(x1,y1)(其中x1=x0+col,y1=y0+row)---------> (2)
右旋后坐标在Map中坐标为(x1',y1')(其中x1'=x0'+col,y1'=y0'+row)---> (3)
由上述方程组不难得出：x1'=y1-row+col,y1'=-x1+row+col
*/
function fuzhuRotate(data,row,col){
var copy=[];
for(var i=0;i<4;i++){
var temp={};
temp.row=-data[i].col+row+col;
temp.col= data[i].row-row+col;
copy.push(temp);
}
return copy;
}
/*
* 说明：由 m 行 Line 组成的格子阵
*/
function myMap(w,h){
//游戏区域的长度和宽度
this.width=w;
this.height=h;
//生成 height 个 line 对象，每个 line 宽度为 width
this.myLines=[];
for(var row=0;row<h;row+=Spacing)
this.myLines[row]=this.newMyLine();
}
//说明：间由 n 个格子组成的一行
myMap.prototype.newMyLine=function(){
var shapes=[];
for(var col=0;col<this.width;col+=Spacing)
shapes[col]=NoShape;
return shapes;
}
//判断一行是否全部被占用
//如果有一个格子为 NoShape 则返回 false
myMap.prototype.isFullLine=function(row){
var line=this.myLines[row];
for(var col=0;col<this.width;col+=Spacing)
if(line[col]==NoShape)
return false;
return true;
}
//判断一行是否为空
//如果有一个格子不为 NoShape 则返回 false
myMap.prototype.isEmptyLine=function(row){
var line=this.myLines[row];
for(var col=0;col<this.width;col+=Spacing)
if(line[col]!=NoShape)
return false;
return true;
}
/*
* 预先移动或者旋转形状，然后分析形状中的四个点是否有碰撞情况：
* 1：col<0 || col>=this.width 超出左右边界
* 2：row==this.height ，说明形状已经到最底部
* 3：任意一点的 shape_id 不为 NoShape ，则发生碰撞
* 如果发生碰撞则放弃移动或者旋转
*/
myMap.prototype.isCollide=function(shape_data){
for(var i=0;i<4;i++){
var row=shape_data[i].row;
var col=shape_data[i].col;
if(col<0 || col>=this.width) return true;
if(row==this.height) return true;
if(row<0) continue;
else
if(this.myLines[row][col]!=NoShape)
return true;
}
return false;
}
//形状在向下移动过程中发生碰撞，则将形状加入到 Map 中
myMap.prototype.appendShape=function(shape_id,shape_data){
var shiftRow = 0;
//对于形状的四个点：
for(var i=0;i<4;i++){
var row=shape_data[i].row;
var col=shape_data[i].col;
//找到所在的格子,将格子的颜色改为形状的颜色
this.myLines[row][col]=shape_id;
}
//========================================
//形状被加入到 Map 中后，要进行逐行检测，发现满行则消除
var myRow=Height-Spacing;
while ((myRow>=0)&&(!this.isEmptyLine(myRow)))
{
if(this.isFullLine(myRow)){
document.getElementById("shotAudio").play();
this.shiftMap(myRow);
drawMap();
score+=100;
document.getElementById('score').value=score;
}
else
{
myRow-=Spacing;
}
}
}
myMap.prototype.shiftMap=function(row){
for (var myRow=row; (myRow>=0)&&(!this.isEmptyLine(myRow)); myRow-=Spacing)
{
var belowRow = this.myLines[myRow];
var upRow = this.myLines[myRow-Spacing];
if (upRow<0)
{
for(var col=0;col<this.width;col+=Spacing)
{
upRow[col] = NoShape;
}
}
for(var col=0;col<this.width;col+=Spacing)
{
belowRow[col] = upRow[col];
}
}
}
function drawMap() {
var row,col;
for (row=0; row<t.theMap.height; row+=Spacing)
{
for (col=0; col<t.theMap.width; col+=Spacing)
{
ctx.fillStyle=Colors[t.theMap.myLines[row][col]];
ctx.fillRect(col+1,row+1,Spacing-2,Spacing-2);
}
}
}
function Tetris(){
this.theMap=new myMap(Width,Height);
this.bornTetris();
}
Tetris.prototype.bornTetris=function(){
this.shape_id=Math.floor(Math.random()*7)+1;
this.shape_data=Shapes[this.shape_id];
this.row=Spacing;
this.col=100;
this.shape_data=translateToMap(this.shape_data,this.row,this.col,Spacing);
}
function drawTetris(tetr)
{
var x,y;
ctx.fillStyle=Colors[tetr.shape_id];
for(var i=0;i<4;i++){
y=tetr.shape_data[i].row;
x=tetr.shape_data[i].col;
ctx.fillRect(x+1,y+1,Spacing-2,Spacing-2);
}
}
//俄罗斯方块左移
Tetris.prototype.tetrisLeft=function(){
//如果处于暂停，任何移动和旋转操作都应无效
if ("开始"==document.getElementById("playBtn").value) { return; }
for (var i=0; i<4; i++)
{
this.shape_data[i].col -= Spacing;
}
if (this.theMap.isCollide(this.shape_data))
{//发生碰撞则放弃移动
for (var i=0; i<4; i++)
{
this.shape_data[i].col += Spacing;
}
}
else
{//通知数据发生了变化
this.col -= Spacing;
}
}
//俄罗斯方块右移
Tetris.prototype.tetrisRight=function(){
//如果处于暂停，任何移动和旋转操作都应无效
if ("开始"==document.getElementById("playBtn").value) { return; }
for (var i=0; i<4; i++)
{
this.shape_data[i].col += Spacing;
}
if (this.theMap.isCollide(this.shape_data))
{//发生碰撞则放弃移动
for (var i=0; i<4; i++)
{
this.shape_data[i].col -= Spacing;
}
}
else
{//通知数据发生了变化
this.col += Spacing;
}
}
//俄罗斯方块旋转
Tetris.prototype.tetrisRotate=function(){
//如果处于暂停，任何移动和旋转操作都应无效
if ("开始"==document.getElementById("playBtn").value) { return; }
//正方形不旋转
if(this.shape_id==SquareShape) return;
//获得旋转后的数据
var copy=fuzhuRotate(this.shape_data,this.row,this.col);
//发生碰撞则放弃旋转
if(this.theMap.isCollide(copy))
{
return;
}
//将旋转后的数据设为当前数据
this.shape_data=copy;
}
//俄罗斯方块下移
Tetris.prototype.tetrisDown=function(){
//如果处于暂停，任何移动和旋转操作都应无效
if ("开始"==document.getElementById("playBtn").value) { return; }
for (var i=0; i<4; i++)
{
this.shape_data[i].row += Spacing;
}
if (this.theMap.isCollide(this.shape_data))
{//发生碰撞则放弃下移
for (var i=0; i<4; i++)
{
this.shape_data[i].row -= Spacing;
}
if (Spacing == this.row)
{//如果位于出生点也无法下移，说明游戏结束
clearInterval(tIntv);
clearInterval(frameIntv);//停止动画
document.getElementById("bgAudio").pause();
alert("Game Over!");
return;
}
//无法下落则将当前形状加入到Map中
this.theMap.appendShape(this.shape_id,this.shape_data);
//产生一个新的俄罗斯方块
this.bornTetris();
}
else
{
this.row += Spacing;
}
}
//响应键盘按下事件，探测方向键按钮是否按下，并做相应的处理
function getKeyAndMove(event){
var keyCode; //记录按下的键盘按键的键码
if (event == null)//根据不同的浏览器，用不同的方式获得keyCode
{
keyCode = window.event.keyCode;
window.event.preventDefault();
}
else
{
keyCode = event.keyCode;
event.preventDefault();
}
//根据不同的keyCode作出响应
switch(keyCode)
{
case 0x25: //方向左键
case 65: //A 向左
{
t.tetrisLeft();
break;
}
case 0x27: //方向右键
case 68: //D 向右
{
t.tetrisRight();
break;
}
case 0x28: //方向右键
case 83: //S 向下
{
t.tetrisDown();
break;
}
case 0x26: //方向上键
case 87: //W 旋转
{
t.tetrisRotate();
break;
}
default:
{//如果按键不是方向键，取消键盘事件侦听
//window.removeEventListener('keydown',getkeyAndMove,false);
}
}
}