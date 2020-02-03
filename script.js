const CANVAS_SIZE = 1000;
const MAX_DEPTH = 6;

// Function to convert RGBA colors to CSS string.
function colorToString(r, g, b, a) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function screenToCanvas(canvas, x, y) {
    var scale = CANVAS_SIZE / canvas.scrollWidth;

    return [
        (x - canvas.offsetLeft) * scale,
        (y - canvas.offsetTop) * scale,
    ];
}

class QuadTree {

    constructor(source_context, dest_context, x, y, size, depth) {
        this.source = source_context;
        this.dest = dest_context;

        this.x = x;
        this.y = y;
        this.size = size;
        this.depth = depth;

        this.children = null;
    }

    average() {
        var mid = Math.floor(this.size / 2);

        // Get the pixel color of the middle pixel.
        return this.source.getImageData(this.x + mid, this.y + mid, 1, 1).data;
    }

    render() {
        if (this.children) {
            // If there are children, render them instead.
            for (var child of this.children) {
                child.render();
            }
        } else if (this.depth < MAX_DEPTH) {
            // If below the max depth, render the average color.
            this.dest.fillStyle = colorToString(...this.average());
            this.dest.fillRect(this.x, this.y, this.size, this.size);
        } else {
            // Otherwise render the original image in this region.
            this.dest.drawImage(
                this.source.canvas,
                this.x, this.y, this.size, this.size,
                this.x, this.y, this.size, this.size,
            );
        }
    }

    trigger(x, y) {
        // If triggerred within this square.
        if (this.x <= x && x < this.x + this.size) {
            if (this.y <= y && y < this.y + this.size) {
                if (this.children) {
                    // Trigger children if they exist.
                    for (var child of this.children) {
                        child.trigger(x, y);
                    }
                } else {
                    // Split self if at the end.
                    this.split();
                }
            }
        }
    }

    split() {
        var mid = Math.floor(this.size / 2);

        if (this.depth < MAX_DEPTH && mid >= 1) {
            // Add the children to the tree.
            this.children = [
                new QuadTree(
                    this.source, this.dest,
                    this.x, this.y,
                    mid, this.depth + 1,
                ),
                new QuadTree(
                    this.source, this.dest,
                    this.x + mid, this.y,
                    this.size - mid, this.depth + 1,
                ),
                new QuadTree(
                    this.source, this.dest,
                    this.x, this.y + mid,
                    this.size - mid, this.depth + 1,
                ),
                new QuadTree(
                    this.source, this.dest,
                    this.x + mid, this.y + mid,
                    this.size - mid, this.depth + 1,
                ),
            ];

            // Rerender this node.
            this.render();
        }
    }

}

// Create an image element to load the picture.
var image = document.createElement('img');

// Get the original image canvas and context.
var src_canvas = document.createElement('canvas');
var src_context = src_canvas.getContext('2d');
// Update the rendering size.
src_canvas.width = CANVAS_SIZE;
src_canvas.height = CANVAS_SIZE;

// Get the game canvas and context.
var dest_canvas = document.getElementById('canvas');
var dest_context = dest_canvas.getContext('2d');
// Update the rendering size.
dest_canvas.width = CANVAS_SIZE;
dest_canvas.height = CANVAS_SIZE;

// Begin game after image is loaded.
image.addEventListener('load', function () {
    // Draw the image in the source canvas for pixel manipulation.
    src_context.drawImage(image, 0, 0, 1000, 1000);

    // Create a tree root.
    var root = new QuadTree(src_context, dest_context, 0, 0, CANVAS_SIZE, 0);
    // Render initial state.
    root.render();

    // Bind mouse to trigger tree.
    dest_canvas.addEventListener('mousemove', function (event) {
        root.trigger(
            ...screenToCanvas(dest_canvas, event.clientX, event.clientY),
        );
    });

    // Bind touch to trigger tree.
    dest_canvas.addEventListener('touchmove', function (event) {
        // root.trigger(...screenToCanvas(dest_canvas, ))
        root.trigger(
            ...screenToCanvas(dest_canvas, event.touches[0].clientX, event.touches[0].clientY)
        )
        event.preventDefault();
    });
});

// Start loading the game image.
image.src = 'test.jfif';
