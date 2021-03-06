var stage;
var background;
var valveEng;
var valveDeeng;

var valves = {};


// *****
// Valve
// *****

function Valve(id, stage, bitmapEng, bitmapDeeng, x, y, rotation, scaleX, scaleY) {
    this.initialise(id, stage, bitmapEng, bitmapDeeng, x, y, rotation, scaleX, scaleY);
}


Valve.prototype.initialise = function(id, stage, bitmapEng, bitmapDeeng, x, y, rotation, scaleX, scaleY) {
    this._stage = stage;
    this._id = id;
    this._bitmapEng = bitmapEng.clone();
    this._bitmapDeeng = bitmapDeeng.clone();

    this._bitmapEng.regX = this._bitmapEng.image.width/2;
    this._bitmapEng.regY = this._bitmapEng.image.height/2;
    this._bitmapDeeng.regX = this._bitmapDeeng.image.width/2;
    this._bitmapDeeng.regY = this._bitmapDeeng.image.height/2;

    if (rotation !== undefined) {
        this._bitmapEng.rotation = rotation;
        this._bitmapDeeng.rotation = rotation;
    }
    if (scaleX !== undefined) {
        this._bitmapEng.scaleX = scaleX;
        this._bitmapDeeng.scaleX = scaleX;
    }
    if (scaleY !== undefined) {
        this._bitmapEng.scaleY = scaleY;
        this._bitmapDeeng.scaleY = scaleY;
    }

    this._container = new createjs.Container();
    this._container.addChild(this._bitmapEng);
    this._container.addChild(this._bitmapDeeng);
    this._stage.addChild(this._container);

    // FIXME : need to centre the two images inside the container and need to work with container's height, not an embedded image.
    this._container.x = x + 
        (this._bitmapEng.image.width * Math.abs(this._bitmapEng.scaleX))/2;
    this._container.y = 1217-y - 
        (this._bitmapEng.image.height * Math.abs(this._bitmapEng.scaleY))/2;



    this._timeTillChangeComplete = 0;
    this._changeDuration = 2; // seconds

    this.unknown();
    this.clearFault();

    // Set hit area
    var hitArea = new createjs.Shape();
    var ix = this._bitmapEng.image.width;
    var iy = this._bitmapEng.image.height
    hitArea.graphics.beginFill("#000").rect(-ix/2, -iy/2, ix, iy);
    //this._container.addChild(hitArea);
    this._container.hitArea = hitArea;

    // Listen for click events
    //this._container.addEventListener("click", function(event) { console.log("valve was clicked"); });
    var self = this;
    this._container.addEventListener("click", function() { Valve.prototype.onClick.call(self); } );
    //this._container.addEventListener("dblclick", function() { Valve.prototype.onDblClick.call(self); } );
}


Valve.prototype.auto = function() {
    this._auto = true;
}

Valve.prototype.manual = function() {
    this._auto = false;
}


Valve.prototype.eng = function() {
    this._state = "eng";
    this._bitmapEng.alpha = 1;
    this._bitmapDeeng.alpha = 0.1;
    //this._stage.update();
}

Valve.prototype.deeng = function() {
    this._state = "deeng";
    this._bitmapEng.alpha = 0.1;
    this._bitmapDeeng.alpha = 1;
    //this._stage.update();
}

Valve.prototype.unknown = function() {
    this._state = "unknown";
    this._bitmapEng.alpha = 0.3;
    this._bitmapDeeng.alpha = 0.3;
    //this._stage.update();
}

Valve.prototype.fault = function() {
    this._fault = true;

    //var filterNoRed = new createjs.ColorFilter(0, 1, 1, 1);
    //this._bitmapEng.filters = [filterNoRed];
    //this._container.cache(0,0, this._bitmapEng.image.width, this._bitmapEng.image.height);
    //this._container.updateCache();
    this._stage.update();
}

Valve.prototype.clearFault = function() {
    this._fault = false;
    this._bitmapEng.filters = undefined;
    this._stage.update();
}

Valve.prototype.tick = function() {
    if (this._timeTillChangeComplete <= 0) return;

    var changePercentage
        
}

Valve.prototype.event = function(data) {
    parts = this._id.split(".");
    for (i=0; i<parts.length; i++) {
        data = data[parts[i]];
    }

    if (data.status.out) {
        this.eng();
    } else {
        this.deeng();
    }

    if (data.status.man) {
        this.manual();
    } else {
        this.auto();
    }
}

Valve.prototype.onClick = function() {
    var self = this;
    console.log("Valve "+self._id+" was clicked");
    if (self._auto) {
        // Move to manual mode
        console.log("Moving valve "+self._id+" to manual mode");
        $.ajax( { url: "/write?"+self._id+"=manual",
                  dataType: "json",
                  type: "GET"
                })
            .done( function(data) {
                console.log("Finished sending manual command to valve "+self._id+" received:",data);
            })
            .fail( function() {
                console.log("Failed to send manual command to valve "+self._id);
            });        
    }
    else if (self._state == "eng") {
        // Send a deeng command
        console.log("Deenergising valve "+self._id);
        $.ajax( { url: "/write?"+self._id+"=manualOff",
                  dataType: "json",
                  type: "GET"
                })
            .done( function(data) {
                console.log("Finished sending deeng command to valve "+self._id+" received:",data);
            })
            .fail( function() {
                console.log("Failed to send deeng command to valve "+self._id);
            });
    }
    else if (self._state == "deeng") {
        // Send an eng command
        console.log("Energising valve "+self._id);
        $.ajax( { url: "/write?"+self._id+"=manualOn",
                  dataType: "json",
                  type: "GET"
                })
            .done( function(data) {
                console.log("Finished sending eng command to valve "+self._id+" received:", data);
            })
            .fail( function() {
                console.log("Failed to send eng command to valve "+self._id);
            });
    }
};

/*
Valve.prototype.onDblClick = function() {
    var self = this;
    console.log("Valve "+self._id+" was double-clicked");
    if (self._auto) {
        // Move to manual mode
        console.log("Moving valve "+self._id+" to manual mode");
        $.ajax( { url: "/write?"+self._id+"=manual",
                  dataType: "json",
                  type: "GET"
                })
            .done( function(data) {
                console.log("Finished sending manual command to valve "+self._id+" received:",data);
            })
            .fail( function() {
                console.log("Failed to send manual command to valve "+self._id);
            });        
    } else {
        // Move to auto mode
        console.log("Moving valve "+self._id+" to auto mode");
        $.ajax( { url: "/write?"+self._id+"=auto",
                  dataType: "json",
                  type: "GET"
                })
            .done( function(data) {
                console.log("Finished sending auto command to valve "+self._id+" received:",data);
            })
            .fail( function() {
                console.log("Failed to send auto command to valve "+self._id);
            });        
    }
};
*/


// EventSource
var eventSource;

function openEventSource() {
    var queryString = "";
    var queryIDs = [];
    for (var v in valves) {
        queryIDs.push(valves[v]._id)
    }

    queryString = "obj="+queryIDs.join(",");

    var address = "/events?"+queryString;
    console.log("Creating EventSource from "+address);
    return new EventSource(address);
}


function onEventSourceMessage(event) {
    var data = JSON.parse(event.data);

    for (v in valves) {
        valves[v].event( data );
    }

    stage.update();
}







// EaselJS 



function init() {
    stage = new createjs.Stage("demoCanvas");
    
    background = new createjs.Bitmap("images/background.png");
    stage.addChild(background);


    ivEng = new createjs.Bitmap("images/ivEng.png");
    ivDeeng = new createjs.Bitmap("images/ivDeeng.png");

    valves["iv01"] =  new Valve("hof3.iv01", stage, ivEng, ivDeeng, 520,  463, rotation=90);
    valves["iv02"] = new Valve("hof3.iv02", stage, ivEng, ivDeeng, 855,  543, rotation=90);
    valves["iv03"] = new Valve("hof3.iv03", stage, ivEng, ivDeeng, 975,  543, rotation=90);
    valves["iv04"] = new Valve("hof3.iv04", stage, ivEng, ivDeeng, 1075, 708, rotation=0);
    valves["iv05"] = new Valve("hof3.iv05", stage, ivEng, ivDeeng, 790,  618, rotation=0);
    valves["iv06"] = new Valve("hof3.iv06", stage, ivEng, ivDeeng, 755,  708, rotation=0);
    valves["iv07"] = new Valve("hof3.iv07", stage, ivEng, ivDeeng, 755,  948, rotation=90);
    valves["iv08"] = new Valve("hof3.iv08", stage, ivEng, ivDeeng, 330, 1068);
    valves["iv09"] = new Valve("hof3.iv09", stage, ivEng, ivDeeng, 325,  923, rotation=90);
    valves["iv10"] = new Valve("hof3.iv10", stage, ivEng, ivDeeng, 195,  888);
    valves["iv15"] = new Valve("hof3.iv15", stage, ivEng, ivDeeng, 215,  458);
    valves["iv16"] = new Valve("hof3.iv16", stage, ivEng, ivDeeng, 329,   33);


    dvEng = new createjs.Bitmap("images/dvEng.png");
    dvDeeng = new createjs.Bitmap("images/dvDeeng.png");
    
    valves["dv01"] = new Valve("hof3.dv01", stage, dvEng, dvDeeng, 840,  603, 
                               rotation=null, scaleX=-1, scaleY=-1);
    valves["dv02"] = new Valve("hof3.dv02", stage, dvEng, dvDeeng, 960,  593, 
                               rotation=-90);
    valves["dv03"] = new Valve("hof3.dv03", stage, dvEng, dvDeeng, 920,  833);
    valves["dv04"] = new Valve("hof3.dv04", stage, dvEng, dvDeeng, 450,  983);
    valves["dv05"] = new Valve("hof3.dv05", stage, dvEng, dvDeeng, 445,  323, 
                               rotation=-90);
    valves["dv06"] = new Valve("hof3.dv06", stage, dvEng, dvDeeng, 350,  853, 
                               rotation=-90, scaleX=0.67, scaleY=-0.67);
    //valves["dv07"] = new Valve("dv07", stage, dvEng, dvDeeng, 445,  323, rotation=-90);

    bfEng = new createjs.Bitmap("images/bfEng.png");
    bfDeeng = new createjs.Bitmap("images/bfDeeng.png");

    valves["bf01"] = new Valve("hof3.bf01", stage, bfEng, bfDeeng, 1080,  973);


/*
    createjs.Ticker.addEventListener("tick", function(event) {
        if (valve.rotationTarget - valve.rotation > delta) {
            // Valve needs to be rotated
        }
        valve.rotation += valve.rotationDirection * 360/5 * event.delta/1000;
        stage.update();
    });
*/


    stage.update();

    eventSource = openEventSource();
    eventSource.onmessage = onEventSourceMessage;
    eventSource.onopen = function() {
        console.log("EventSource is open.");
    };


}
