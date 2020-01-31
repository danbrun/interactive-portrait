class QuadTree {
	constructor(context, x1, y1, x2, y2, depth) {
    	this.context = context;
    	this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.isSplit = false;
        this.depth = depth;
        this.tree1 = null;
        this.tree2 = null;
        this.tree3 = null;
        this.tree4 = null;
    }
    
    render(){
        if(this.isSplit){
            this.tree1.render();
            this.tree2.render();
            this.tree3.render();
            this.tree4.render();
        }

        var colAvg = getAvg();
        
    	context.fillStype = "rgba(" + colAvg[0] + "," + colAvg[1] + "," + colAvg[2] + "," + 1 + ")";
        context.fillRect(x,y,size,size);
    }

    getAvg(){
        var avg = new Array(3); //representation of average colors as integer array

        var num_pixels_scanned = 0;

        for(var x = this.x1; x < this.x2; x += 4){
            for(var y = this.y1; y < this.y2; y += 4){
                //FIX THIS I DON'T KNOW HOW TO DO THIS AHDHASKLJDLJKAHBKVBL
                this.context.get_color()
                //add the r g b values of the color at the point [x,y] to the average
                //avg[0] += r;
                //avg[1] += g;
                //avg[2] += b;
            }
        }
        
        avg[0] /= num_pixels_scanned;
        avg[1] /= num_pixels_scanned;
        avg[2] /= num_pixels_scanned;

        return avg;
    }

    onclick(){
        var x1_5 = avg(x1,x2);
        var y1_5 = avg(y1,y2);


        if(mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2){
            if(this.isSplit){
                //check which quadrant the mouse is in
                if(mouseX < x1_5 && mouseY < y1_5){
                    this.tree1.onclick();
                }
                if(mouseX > x1_5 && mouseY < y1_5){
                    this.tree2.onclick();
                }
                if(mouseX < x1_5 && mouseY > y1_5){
                    this.tree3.onclick();
                }
                if(mouseX > x1_5 && mouseY > y1_5){
                    this.tree4.onclick();
                }
            } else { //if quadrant is not split
                this.splitSelf();
            }
        } else {
            //THROW ERROR of some flavor
        }
        
    }

    splitSelf(){
        var x1_5 = avg(x1,x2);
        var y1_5 = avg(y1,y2);

        //create four child trees
        this.tree1 = new QuadTree(this.context,this.x1,this.y1,x1_5,y1_5,this.depth+1);
        this.tree2 = new QuadTree(this.context,x1_5,this.y1,this.x2,y1_5,this.depth+1);
        this.tree3 = new QuadTree(this.context,this.x1,y1_5,x1_5,y2,this.depth+1);
        this.tree4 = new QuadTree(this.context,x1_5,y1_5,this.x2,this.y2,this.depth+1);

        this.isSplit = true;
    }
}

var cvs = document.getElementById("Image");

var startingBoi = new QuadTree(canvas.getContext("2d"),0,0,cvs.width,cvs.height,cvs.width,cvs.height,0);

startingBoi.render();

function onclick(){
    startingBoi.onclick();
}