include(`m4/header.m4')dnl
htmlHeader(`Drain Feedtank',`Drain_Page')

<h2>Target</h2>

<p>Draining the feedtank can be either to waste or to the storage tank.</p>

  <fieldset data-role="controlgroup" data-type="horizontal" style="display:inline;">
    <legend>Target:</legend>
    <label><input type="radio" name="target" value="waste" checked="checked"/>
      Waste</label>
    <label><input type="radio" name="target" value="store"/>
      Storage Tank</label>
  </fieldset>


<h2>Direction Change Frequency</h2>

<p>This value applies to both the active and passive stages.</p>

  <label for="drainDirectionChangeFreq">Direction change frequency
  during draining (seconds between direction changes):</label>
  <input name="drainDirectionChangeFreq" id="drainDirectionChangeFreq" type="text">


<h2>Active drain</h2>

<p>The first stage to draining is active.  The pump is run during this
stage, until the feed tank level gets below a certain threshold.</p>

  <label for="drainLevel">Pump contents while tank level is above (%):</label>
  <input name="drainLevel" id="drainLevel" data-highlight="true" min="0" max="100" value="5" type="range">

  <label for="drainPumpSpeed">Pump speed while draining (%):</label>
  <input name="drainPumpSpeed" id="drainPumpSpeed" data-highlight="true" min="0" max="100" value="25" type="range">

<h2>Passive drain</h2>

<p>The second stage is passive draining.  In this stage, the remaining
contents can no longer be pumped.  The valves are left open and the
membrane direction valves change, in order to let the plant drain
completely.</p>

  <label for="drainTime">Drain time:</label>
  <input name="drainTime" id="drainTime" type="text">







<h1>Messages</h1>
<div id="Drain_Message">Waiting for plant status information</div>


  <fieldset class="ui-grid-a">
    <div class="ui-block-a">
      <a href="index.html" data-theme="a" data-rel="back" data-role="button">
        Cancel</a>
    </div>
    <div class="ui-block-b">
      <button data-theme="b" id="Drain_StartBtn">
        Start Drain</button>
    </div>	   
  </fieldset>


htmlHeaderEnd()
