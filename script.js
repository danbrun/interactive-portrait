const MAX_DEPTH = 6;

// Function to convert RGBA colors to CSS string.
function colorToString(r, g, b, a) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Convert screen coordinates to canvas coordinates.
function screenToCanvas(canvas, x, y) {
    var scaleX = image.width / canvas.scrollWidth;
    var scaleY = image.height / canvas.scrollHeight;

    return [
        (x - canvas.offsetLeft) * scaleX,
        (y - canvas.offsetTop) * scaleY,
    ];
}

// Sounds a number to the specified number of decimal points.
function roundTo(number, decimals) {
    var scale = Math.pow(10, decimals);
    return Math.round(number * scale) / scale;
}

// Track splits and maximum splits.
var numberSplits = 0;
var maximumSplits = 0;

// Get the maximum number of splits that can occur.
for (let depth = 0; depth < MAX_DEPTH; depth++) {
    maximumSplits += Math.pow(4, depth);
}

// URL to song files.
var audio = [];

// Get audio elements for each song.
for (let song = 0; song < 5; song++) {
    // Get the song element.
    let newSong = new Audio(`music/scene_${song + 1}.mp3`);

    // Make the song loop.
    newSong.loop = true;
    newSong.volume = 0;

    // Add the song to the playlist.
    audio.push(newSong);
}

// Fade in a song.
function fadeIn(song) {
    // Start the music if it isn't playing.
    if (song.paused) {
        song.volume = 0;
        song.play();
    }

    // Fade in until full volume is reached.
    if (song.volume < 1) {
        song.volume = roundTo(song.volume + 0.1, 1);
        setTimeout(fadeIn, 100, song);
    }
}

// Fade out a song.
function fadeOut(song) {
    // Fade out until volume is 0.
    if (song.volume > 0) {
        song.volume = roundTo(song.volume - 0.1, 1);
        setTimeout(fadeOut, 100, song);
    }
}

// Music can't start until user interacts with page.
var currentSong = -1;

// Update music based on number of splits.
function updateMusic() {
    // Get the next song based on how many splits have occurred.
    var nextSong = Math.floor(numberSplits * 5 / maximumSplits);

    // If the song has changed.
    if (nextSong != currentSong) {
        // Fade out the previous song if one was playing.
        if (currentSong != -1) {
            fadeOut(audio[currentSong]);
        }

        // Fade in the new song.
        fadeIn(audio[nextSong]);
        currentSong = nextSong;
    }
}

class QuadTree {

    constructor(source_context, dest_context, x, y, w, h, depth) {
        this.source = source_context;
        this.dest = dest_context;

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.depth = depth;

        this.children = null;
    }

    average() {
        // Get the pixel color of the middle pixel.
        // return this.source.getImageData(this.x + midW, this.y + midH, 1, 1).data;
        var pixels = this.source.getImageData(this.x, this.y, this.w, this.h);

        var count = this.w * this.h;
        var totals = [0, 0, 0, 0];

        for (var pixel = 0; pixel < count; pixel += 5) {
            for (var component = 0; component < 4; component++) {
                totals[component] += pixels.data[pixel + component];
            }
        }

        for (var component = 0; component < 4; component++) {
            totals[component] /= count / 5;
        }

        return totals;
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
            this.dest.fillRect(this.x, this.y, this.w, this.h);
        } else {
            // Otherwise render the original image in this region.
            this.dest.drawImage(
                this.source.canvas,
                this.x, this.y, this.w, this.h,
                this.x, this.y, this.w, this.h,
            );
        }
    }

    trigger(x, y) {
        // If triggerred within this square.
        if (this.x <= x && x < this.x + this.w) {
            if (this.y <= y && y < this.y + this.h) {
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
        var midW = Math.floor(this.w / 2);
        var midH = Math.floor(this.h / 2);

        if (this.depth < MAX_DEPTH && midW >= 1 && midH >= 1) {
            // Add the children to the tree.
            this.children = [
                new QuadTree(
                    this.source, this.dest,
                    this.x, this.y,
                    midW, midH,
                    this.depth + 1,
                ),
                new QuadTree(
                    this.source, this.dest,
                    this.x + midW, this.y,
                    this.w - midW, midH,
                    this.depth + 1,
                ),
                new QuadTree(
                    this.source, this.dest,
                    this.x, this.y + midH,
                    midW, this.h - midH,
                    this.depth + 1,
                ),
                new QuadTree(
                    this.source, this.dest,
                    this.x + midW, this.y + midH,
                    this.w - midW, this.h - midH,
                    this.depth + 1,
                ),
            ];

            // Rerender this node.
            this.render();

            numberSplits++;
            updateMusic();
        }
    }

}

// Create an image element to load the picture.
var image = new Image();

// Get the original image canvas and context.
var src_canvas = document.createElement('canvas');
var src_context = src_canvas.getContext('2d');

// Get the game canvas and context.
var dest_canvas = document.getElementById('canvas');
var dest_context = dest_canvas.getContext('2d');

// Begin game after image is loaded.
image.addEventListener('load', function () {
    // Update the rendering size.
    src_canvas.width = image.width;
    src_canvas.height = image.height;

    // Update the rendering size.
    dest_canvas.width = image.width;
    dest_canvas.height = image.height;

    // Draw the image in the source canvas for pixel manipulation.
    src_context.drawImage(image, 0, 0, image.width, image.height);

    // Create a tree root.
    var root = new QuadTree(src_context, dest_context, 0, 0, image.width, image.height, 0);
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
image.src = 'animals.png';
