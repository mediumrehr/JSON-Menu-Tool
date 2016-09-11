var JSONstr;
var treeDepth;
var tree = document.createElement("tree_div");
tree.id = 'i0';
tree.innerHTML = '<input type="text" name="fields[0]" id='+tree.id+' value="" />\
  <input type="button" onclick="addSubChild(tree.id)" value="+" style="width: 30px" />';

function addSubChild(parNodeId)
{
  console.log(tree);
  var child = (document.createElement('div'));
  var index = 0;
  var parNode = document.getElementById(parNodeId);
  if (parNode.hasChildNodes()) {
    var str = parNode.lastChild.id;
    index = str.substr( str.length-2,2 );
    if (index.charAt(0) == 'i')
    	index = index.charAt(1);
    index++;
  }
  child.id = parNode.id + 'i' + index;
  var depth = 0;
  var j;
  for (j=0;j<child.id.length;j++) {
    if (child.id.charAt(j) == "i")
      depth++;
  }
  child.innerHTML = '<input style="margin-left:'+50*(depth-1)+'px;" type="text" name="fields['+child.id+']" id='+child.id+' value="" />\
    <input type="button" onclick="addSubChild(\''+child.id+'\')" value="+" style="width: 30px" />\
      <input type="button" onclick="removeSubChild(\''+child.id+'\')" value="-" style="width: 30px" />\
      <select name="sel['+child.id+']" id="sel'+child.id+'" value="none" />\
      <option value="none">None</option><option value="knob">Knob</option><option value="joystick">Joystick</option>\
      <option value="upDwn">&Delta;&nabla; Buttons</option><option value="up+dwn">&Delta;+&nabla; Buttons</option>\
      <option value="set">set button</option><option value="sel">sel button</option><option value="menu">menu button</option>\
      <option value="enter">enter button</option><option value="exit">exit button</option><option value="ex+ent">ex+ent bttns</option>\
      <option value="ex+dwn">ex+&nabla; bttns</option><option value="ent+up">ent+&Delta; bttns</option>\
      <option value="scan">scan button</option><option value="holdScan">hold scan</option></select>\
      <input type="checkbox" name="cond['+child.id+']" id="cond'+child.id+'" value="" onClick="condChange(\''+child.id+'\')" />Condition\
      <input type="hidden" name="text['+child.id+']" id="t'+child.id+'" value"0" \>';
  parNode.appendChild(child);
  //console.log(tree);
  return child.id;
}
function condChange(nodeId)
{
	var condNode = document.getElementById('t'+nodeId);
	if (condNode.type == "hidden")
		condNode.type = "text";
	else
		condNode.type = "hidden";
		
}
function removeSubChild(nodeId)
{
  if (nodeId.charAt(nodeId.length-3) == 'i')
  	var parNode = document.getElementById(nodeId.substr(0,nodeId.length-3));
  else
  	var parNode = document.getElementById(nodeId.substr(0,nodeId.length-2));
  console.log(parNode);
  //window.alert(nodeId.substr(0,nodeId.length-2));
  parNode.removeChild(document.getElementById(nodeId));
}
function hasSubFields(nodeId)
{
  var node = document.getElementById(nodeId);
  var numSubFields = 0;
  var child = node.firstChild;
  while(child != null)
  {
    if (child.nodeName == "DIV")
      numSubFields++;
    child = child.nextSibling;
  }
  //window.alert(numSubFields);
  return numSubFields;
}
function printJSON()
{
  saveJSONfile("temp");
  window.open("http://www.robrehrig.com/testing/results.html");
  //window.open("http://www.robrehrig.com/testing/results2.html");
}
function saveJSONfile(fileName)
{
  // Create JSON data string
  JSONstr = "";
  createJSONstr(tree.id);
  JSONstr += '}';
  
  var overWrite = 1;
  
  //Creating a new AJAX request that will request fileName + '.json' from the current directory
    $.ajax({ 
      url: "JSONdata/" + fileName + ".json",
      dataType: "text"
    }).done(function ( data ) {
    	if (data.charAt(0) != "<") {
    	if (fileName != "temp")
      		overWrite = confirm('Overwrite '+fileName+'.json?');
      		}
      		
      		if (overWrite) {
	  // Send JSON data string and fileName to be written
	  $.ajax({
		type: "POST",
		url: "writeToFile.php",
		data: {code: JSONstr, file: fileName}
	  });
  
	  if(fileName != "temp")
	  {
		document.getElementById("msgArea").innerHTML = 'File '+fileName+'.json saved!';
		//msgArea.value = "File " + fileName + ".json saved!";
		//alert("File " + fileName + ".json saved!");
	  }
  }
  else
  	document.getElementById("msgArea").innerHTML = 'File '+fileName+'.json NOT saved!';
    }).fail(function(xhr, ajaxOptions, thrownError) {
    	if(thrownError == "Not Found") {
    		$.ajax({
				type: "POST",
				url: "writeToFile.php",
				data: {code: JSONstr, file: fileName}
	  		});
	  		if(fileName != "temp")
				document.getElementById("msgArea").innerHTML = 'File '+fileName+'.json saved!';
    	}
    	else
      		window.alert("Error saving file");
    });
}
function loadJSONfile(fileName)
{
  var overwrite = true;
  if ((tree.firstChild.value != "") || hasSubFields(tree.id))
    overwrite = confirm("Overwrite tree data?");
  if (overwrite) 
  {
    tree.innerHTML = '<input type="text" name="fields[0]" id='+tree.id+' value="" />\
      <input type="button" onclick="addSubChild(tree.id)" value="+" style="width: 30px" />';
    
    //Creating a new AJAX request that will request fileName + '.json' from the current directory
    $.ajax({ 
      url: "JSONdata/" + fileName + ".json",
      dataType: "text"
    }).done(function ( data ) {
      if( console && console.log ) {
        //console.log(data);
        if (isValidFile(data, fileName)) {
          var i = 0;
          var loop = 1;
          while (loop) 
          {
            if (data.substr(i,7) == '"name":')
            {
              var valueStr = "";
              i += 9;
              while (data.charAt(i) != '"')
              {
                valueStr += data.charAt(i);
                i++;
              }
              tree.firstChild.value = valueStr;
            }
            if (data.substr(i,11) == '"children":')
            {
              i+=13;
              loop = 0;
            }
            i++;
          }
          parseJSONfile(data.substr(i,data.length-(i+1)),tree.id);
          
          document.getElementById("msgArea").innerHTML = 'File '+fileName+'.json loaded!';
        }
      }
    }).fail(function() {
      alert("Error loading file");
    });
  }
}
function parseJSONfile(fileData,nodeId)
{
  //console.log(fileData);
  var childId = "";
  var node = document.getElementById(nodeId);
  var dataIndex = 0;
  var tempStr = '';
  while (dataIndex<fileData.length)
  {
  	interact = 0;
    if (fileData.substr(dataIndex,7) == '"name":')
    {
      childId = addSubChild(nodeId);
      var valueStr = "";
      dataIndex += 9;
      while (fileData.charAt(dataIndex) != '"')
      {
        if (fileData.substr(dataIndex,10) == ' with knob') {
        	dataIndex += 9;
            document.getElementById('sel'+childId).value = "knob";
        }
        else if (fileData.substr(dataIndex,17) == ' with joystick up') {
        	dataIndex += 16;
            document.getElementById('sel'+childId).value = "joystick";
        }
        else if (fileData.substr(dataIndex,19) == ' with joystick down') {
        	dataIndex += 18;
            document.getElementById('sel'+childId).value = "joystick";
        }
        else if (fileData.substr(dataIndex,19) == ' with joystick left') {
        	dataIndex += 18;
            document.getElementById('sel'+childId).value = "joystick";
        }
        else if (fileData.substr(dataIndex,20) == ' with joystick right') {
        	dataIndex += 19;
            document.getElementById('sel'+childId).value = "joystick";
        }
        else if (fileData.substr(dataIndex,14) == ' with joystick') {
        	dataIndex += 13;
            document.getElementById('sel'+childId).value = "joystick";
        }
        else if (fileData.substr(dataIndex,32) == ' with navigation up/down buttons') {
        	dataIndex += 31;
            document.getElementById('sel'+childId).value = "upDwn";
        }
        else if (fileData.substr(dataIndex,21) == ' with up/down buttons') {
        	dataIndex += 20;
            document.getElementById('sel'+childId).value = "upDwn";
        }
        else if (fileData.substr(dataIndex,23) == ' with up + down buttons') {
        	dataIndex += 22;
            document.getElementById('sel'+childId).value = "up+dwn";
        }
        else if (fileData.substr(dataIndex,18) == ' with enter button') {
        	dataIndex += 17;
            document.getElementById('sel'+childId).value = "enter";
        }
        else if (fileData.substr(dataIndex,17) == ' with exit button') {
        	dataIndex += 16;
            document.getElementById('sel'+childId).value = "exit";
        }
        else if (fileData.substr(dataIndex,26) == ' with exit + enter buttons') {
        	dataIndex += 25;
            document.getElementById('sel'+childId).value = "ex+ent";
        }
        else if (fileData.substr(dataIndex,25) == ' with exit + down buttons') {
        	dataIndex += 24;
            document.getElementById('sel'+childId).value = "ex+dwn";
        }
        else if (fileData.substr(dataIndex,24) == ' with enter + up buttons') {
        	dataIndex += 23;
            document.getElementById('sel'+childId).value = "ent+up";
        }
        else if (fileData.substr(dataIndex,17) == ' with menu button') {
        	dataIndex += 16;
            document.getElementById('sel'+childId).value = "menu";
        }
        else if (fileData.substr(dataIndex,16) == ' with set button') {
        	dataIndex += 15;
            document.getElementById('sel'+childId).value = "set";
        }
        else if (fileData.substr(dataIndex,16) == ' with sel button') {
        	dataIndex += 15;
            document.getElementById('sel'+childId).value = "sel";
        }
        else if (fileData.substr(dataIndex,17) == ' with scan button') {
        	dataIndex += 16;
            document.getElementById('sel'+childId).value = "scan";
        }
        else if (fileData.substr(dataIndex,25) == ' when scan button is held') {
        	dataIndex += 24;
            document.getElementById('sel'+childId).value = "holdScan";
        }
        else if (fileData.substr(dataIndex,2) == ' (') {
        	dataIndex += 2;
        	tempStr = '';
        	while(fileData.charAt(dataIndex) != ')') {
        		tempStr += fileData.charAt(dataIndex);
        		dataIndex++;
        	}
        	document.getElementById('cond'+childId).checked = true;
        	document.getElementById('t'+childId).value = tempStr;
        	document.getElementById('t'+childId).type = "text";
        }
        else
        	valueStr += fileData.charAt(dataIndex);
        dataIndex++;
      }
      document.getElementById(childId).firstChild.value = valueStr;
    }
    //console.log(currChild);
    if (fileData.substr(dataIndex,11) == '"children":')
    {
      dataIndex+=13;
      dataIndex += parseJSONfile(fileData.substr(dataIndex,fileData.length-1),childId);
    }
    dataIndex++;
    if ((fileData.charAt(dataIndex) == ']') || (dataIndex >= fileData.length-1))
    {
      //console.log("end");
      return dataIndex;
    }
  }
}
function isValidFile(data, fileName)
{
  if (data.charAt(0) == "<") {
    document.getElementById("msgArea").innerHTML = 'Sorry, no file called '+fileName+'.json.';
    return false;
  }
  else {
    //tree.firstChild.value = data;
    return true;
  }
}
function createJSONstr(nodeId)
{
  var node = document.getElementById(nodeId);
  JSONstr += '{"name": "' + node.firstChild.value;
  if (nodeId != "i0") {
  	if (document.getElementById('sel'+nodeId).value == "knob")
  		JSONstr += ' with knob';
  	else if (document.getElementById('sel'+nodeId).value == "joyUp")
  		JSONstr += ' with joystick up';
  	else if (document.getElementById('sel'+nodeId).value == "joyDown")
  		JSONstr += ' with joystick down';
  	else if (document.getElementById('sel'+nodeId).value == "joyLeft")
  		JSONstr += ' with joystick left';
  	else if (document.getElementById('sel'+nodeId).value == "joyRight")
  		JSONstr += ' with joystick right';
  	else if (document.getElementById('sel'+nodeId).value == "joystick")
  		JSONstr += ' with joystick';
  	else if (document.getElementById('sel'+nodeId).value == "upDwn")
  		JSONstr += ' with up/down buttons';
  	else if (document.getElementById('sel'+nodeId).value == "up+dwn")
  		JSONstr += ' with up + down buttons';
  	else if (document.getElementById('sel'+nodeId).value == "enter")
  		JSONstr += ' with enter button';
  	else if (document.getElementById('sel'+nodeId).value == "exit")
  		JSONstr += ' with exit button';
  	else if (document.getElementById('sel'+nodeId).value == "ex+ent")
  		JSONstr += ' with exit + enter buttons';
  	else if (document.getElementById('sel'+nodeId).value == "ex+dwn")
  		JSONstr += ' with exit + down buttons';
  	else if (document.getElementById('sel'+nodeId).value == "ent+up")
  		JSONstr += ' with enter + up buttons';
  	else if (document.getElementById('sel'+nodeId).value == "menu")
  		JSONstr += ' with menu button';
  	else if (document.getElementById('sel'+nodeId).value == "set")
  		JSONstr += ' with sel button';
  	else if (document.getElementById('sel'+nodeId).value == "sel")
  		JSONstr += ' with set button';
  	else if (document.getElementById('sel'+nodeId).value == "scan")
  		JSONstr += ' with scan button';
  	else if (document.getElementById('sel'+nodeId).value == "holdScan")
  		JSONstr += ' when scan button is held';
  	if (document.getElementById('cond'+nodeId).checked == true)
  		JSONstr += ' (' + document.getElementById('t'+nodeId).value + ')';
  }
  var numSubFields = hasSubFields(nodeId);
  if (numSubFields > 0)
  {
    JSONstr += '", "children": [';
    var child = node.firstChild;
    var currSub = 0;
    while(child != null)
    {
      if (child.nodeName == "DIV") {
        createJSONstr(child.id);
        currSub++;
        if (currSub == numSubFields)
        {
          if (JSONstr.charAt(JSONstr.length-1) == "]")
            JSONstr += '}]';
          else
            JSONstr += '"}]';
        }
        else
          if (JSONstr.charAt(JSONstr.length-1) == "]")
            JSONstr += '},';
        else
          JSONstr += '"},';
      }
      child = child.nextSibling;
    }
  }
  return JSONstr;
}
function closeCode()
{
	document.getElementById("codeViewer").style.visibility = "hidden";
	document.getElementById("codeViewer").style.height = 0;
	document.getElementById("codeText").innerHTML = "";
}
function showCode()
{
	JSONstr = "";
	document.getElementById("codeViewer").style.visibility = "visible";
	document.getElementById("codeText").innerHTML = createJSONstr(tree.id) + '}';
 	document.getElementById("codeViewer").style.height = "auto";
}
function copyCode()
{
	JSONstr = "";
	var text = createJSONstr(tree.id) + '}';
	window.prompt ("Copy to clipboard: Ctrl+C, Enter", text);
}