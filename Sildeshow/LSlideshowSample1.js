function LSlideshowSample1(width,height,isLoop,loopData){
	var self = this;
	base(self,LSprite,[]);
	
	self._slideshowList = new Array();
	self._slideshowIndex = 0;
	self._currentIndex = self._slideshowIndex;
	
	self.rangeWidth = width;
	self.rangeHeight = height;
	self.isLoop = isLoop;
	
	self._toX = 0;
	
	self.nextChildList = new Array();
	self.previousChildList = new Array();
	
	self.borderLayer = new LSprite();
	self.borderLayer.graphics.drawRect(0,"",[0,0,width,height],true,"transparent");
	
	self.contentLayer = new LSprite();
	self.contentLayer.mask = self.borderLayer;
	self.addChild(self.contentLayer);
	
	if(self.isLoop == true){
		self.loopData = loopData;
		self.frameIndex = 0;
		self.maxFrame = Math.floor(self.loopData.delay*1000/LGlobal.speed);
		self.addEventListener(LEvent.ENTER_FRAME,self.loopPlay);
	}
}
LSlideshowSample1.prototype.loopPlay = function(self){
	if(self.contentLayer.childList.length == 0)return;
	if(self.frameIndex++ < self.maxFrame)return;
	self.frameIndex = 0;
	if(self.loopData.order == LSlideshow.RIGHTWARD){
		self.next();
	}else if(self.loopData.order == LSlideshow.LEFTWARD){
		self.previous();
	}else if(self.loopData.order == LSlideshow.RANDOM){
		var index = Math.floor(Math.random()*(self.contentLayer.childList.length-1));
		var order = Math.random() > 0.5 ? LSlideshow.LEFTWARD : LSlideshow.RIGHTWARD;
		self.showFrameAt(index,order);
	}
};
LSlideshowSample1.prototype.setFrame = function(o){
	var self = this;
	var cl = self.contentLayer.childList;
	o.x = self.contentLayer.childList.length * self.rangeWidth;
	o.y = 0;
	self.contentLayer.addChild(o);
	
	self._sortChild();
};
LSlideshowSample1.prototype._sortChild = function(){
	var self = this;
	
	self.nextChildList = new Array();
	self.previousChildList = new Array();
	var duplicate = new Array();
	for(var i=0; i<self.contentLayer.childList.length; i++){
		self.nextChildList.push(i);
		duplicate.push(i);
	}
	self.nextChildList = self.nextChildList.sort();
	duplicate.splice(0,1);
	var sortedList = duplicate.sort(function(a,b){
		return b - a;
	});
	self.previousChildList.push(0);
	for(var key in sortedList){
		self.previousChildList.push(sortedList[key]);
	}
};
LSlideshowSample1.prototype.getFrameIndex = function(){
	var self = this;
	if(self._slideshowIndex < 0){
		var v = self.previousChildList[Math.abs(self._slideshowIndex)];
	}else{
		var v = self.nextChildList[Math.abs(self._slideshowIndex)];
	}
	return v;
};
LSlideshowSample1.prototype.next = function(){
	var self = this;
	
	self._currentIndex += 1;
	self._slideshowIndex += 1;
	
	if(self._slideshowIndex >= self.contentLayer.childList.length){
		self._slideshowIndex = 0;
	}
	
	if(self._slideshowIndex < 0){
		var obj = self.contentLayer.getChildAt(self.previousChildList[Math.abs(self._slideshowIndex)]);
	}else{
		var obj = self.contentLayer.getChildAt(self.nextChildList[Math.abs(self._slideshowIndex)]);
	}
	obj.x = self.rangeWidth*self._currentIndex;
			
	self._toX = -(self._currentIndex*self.rangeWidth);
	
	var tweenObj = LTweenLite.to(self.contentLayer,1,{
		x:self._toX
	});
};
LSlideshowSample1.prototype.previous = function(){
	var self = this;
	
	self._currentIndex -= 1;
	self._slideshowIndex -= 1;
	
	if(self._slideshowIndex < -(self.contentLayer.childList.length-1)){
		self._slideshowIndex = 0;
	}
	
	if(self._slideshowIndex < 0){
		var obj = self.contentLayer.getChildAt(self.previousChildList[Math.abs(self._slideshowIndex)]);
	}else{
		var obj = self.contentLayer.getChildAt(self.nextChildList[Math.abs(self._slideshowIndex)]);
	}
	obj.x = self.rangeWidth*self._currentIndex;
		
	self._toX = -(self._currentIndex*self.rangeWidth);
	
	var tweenObj = LTweenLite.to(self.contentLayer,1,{
		x:self._toX
	});
};
LSlideshowSample1.prototype.showFrameAt = function(index,order){
	var self = this;
	if(self._slideshowIndex < 0){
		if(self.previousChildList[Math.abs(self._slideshowIndex)] == index)return;
	}else{
		if(self.nextChildList[Math.abs(self._slideshowIndex)] == index)return;
	}
	if(order == LSlideshow.LEFTWARD){
		self._currentIndex -= 1;
	}else if(order == LSlideshow.RIGHTWARD){
		self._currentIndex += 1;
	}else{
		self._currentIndex += 1;
	}
	self._slideshowIndex = index;
	
	var obj = self.contentLayer.getChildAt(index);
	obj.x = self.rangeWidth*self._currentIndex;
	
	self._toX = -(self._currentIndex*self.rangeWidth);
	
	var tweenObj = LTweenLite.to(self.contentLayer,1,{
		x:self._toX
	});
};
LSlideshowSample1.prototype.toString = function(){
	return "[LSlideshowSample1]";
};