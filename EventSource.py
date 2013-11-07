from ASCIIClientProtocol import ASCIIClientFactory
from HOF3 import *
from PLCObjects import *
from twisted.web.resource import Resource
from twisted.web.server import NOT_DONE_YET
from twisted.internet import task, defer

import json
import datetime


class EventSource(Resource):
    isLeaf = True
    def __init__(self, plcClient):
        self.plcClient = plcClient        

    def processEvent(self, request):
        # Obtain variables from query string
        response = {}
        deferreds = []
        if "x" in request.args:
            address = request.args["x"][0]
            d = self.plcClient.instance.getRegister(address)
            def onResult(data):
                response["x"] = data
            d.addCallback(onResult)
            deferreds.append(d)
        if "plctime" in request.args:
            plcTime = PLCTime(self.plcClient)
            d = plcTime.get()
            def onResult(data):
                response["time"] = data.isoformat() # The default 'T' character is 
                                                     # important for Firefox
            d.addCallback(onResult)
            deferreds.append(d)
        if "bit" in request.args:
            bit = PLCBit(self.plcClient, 249, 0)
            d = bit.get()
            def onResult(data):
                response["bit"] = data
            d.addCallback(onResult)
            deferreds.append(d)
        if "inputs" in request.args:
            bitSet = PLCBitSet(self.plcClient, 249, ["DI1","DI2","DI3","DI4","DI5","DI6","DI7","DI8"])
            d = bitSet.get()
            def onResult(data):
                response["inputs"] = data
            d.addCallback(onResult)
            deferreds.append(d)

        # Go through the objects in the PLC and check if they've been requested
        for name,obj in self.plcClient.objects.items():
            if name in request.args:
                d = obj.get()
                def make_onResult(n):
                    def f(d):
                        response[n] = d
                    return f
                onResult = make_onResult(name)
                d.addCallback( onResult )
                deferreds.append(d)
            
        # Write event when all the data requested has been obtained
        def writeEvent(data):
            if "time" in request.args:
                response["time"] = datetime.datetime.now().isoformat()
            
            #print "Writing event for response:",response
            request.write("\nevent:\n")
            request.write("data: "+json.dumps(response)+"\n")

        d = defer.gatherResults( deferreds )
        d.addCallback( writeEvent )


    def render_GET(self, request):
        print "Received GET request for EventSource"
        request.setHeader("Content-Type","text/event-stream");

        if "freq" in request.args:
            freq = float(request.args["freq"][0])
        else:
            freq = 0.5 # Repeat every second by default

        loop = task.LoopingCall( lambda: self.processEvent(request) )
        loop.start(freq) 

        # Stop the loop if the connection is closed (e.g. by the client)
        def stopSending(reason):
            if loop.running:
                loop.stop()
        onFinish = request.notifyFinish()
        onFinish.addErrback( stopSending )
        onFinish.addCallback( stopSending )

        return NOT_DONE_YET
