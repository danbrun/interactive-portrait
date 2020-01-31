class QuadTree {
	constructor(context, x1, y1, x2, y2, isSplit, depth) {
    	this.context = context;
    	this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.isSplit = isSplit;
        this.depth = depth;
    }
    
    render(){
    	var colAvg = getAvg(x1, y1, x2, y2);
    	context.fillStype = "rgba(" + colAvg[0] + "," + colAvg[1] + "," + colAvg[2] + "," + 1 + ")";
        context.fillRect(x,y,size,size);
    }

    
    
}