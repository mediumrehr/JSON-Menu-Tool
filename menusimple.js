var JSONstr; // Global to hold the json string
var treeDepth; // Used to keep track of tree depth
var tree = document.createElement("tree_div");
tree.id = 'i0'; // Starting index
tree.innerHTML = '<input type="text" name="fields[0]" id='+tree.id+' value="" />\
  <input type="button" onclick="addSubChild(tree.id)" value="+" style="width: 30px" />';

/*	Function: addSubChild
	Input: parNodeId, the index ID of the parent node
	Description: Adds an indented subform as a child to the parent form. The index for the
		child form is the same as the parent index string plus 'i' and then a number depending
		on how many other children already exist.
*/
function addSubChild(parNodeId)
{
  // console.log(tree);
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
  child.innerHTML = '<input style="color: #999; margin-left:'+50*(depth-1)+'px;" type="text" name="fields['+child.id+']" id='+child.id+'\
  onfocus="if (this.value == \'function\') {this.style.color=\'#000\'; this.value=\'\'}" onblur="if(this.value == \'\') {this.style.color=\'#999\'; this.value=\'function\'}" value="function" />\
  <input style="color: #999;" type="text" name="name['+child.id+']" id="n'+child.id+'" onfocus="if (this.value == \'name\') {this.style.color=\'#000\'; this.value=\'\'}"\
  onblur="if(this.value == \'\') {this.style.color=\'#999\'; this.value=\'name\'}" value="name" />\
    <input type="button" onclick="addSubChild(\''+child.id+'\')" value="+" style="width: 30px" />\
      <input type="button" onclick="removeSubChild(\''+child.id+'\')" value="-" style="width: 30px" />\
      <input type="checkbox" name="cond['+child.id+']" id="cond'+child.id+'" value="" onClick="condChange(\''+child.id+'\')" />Parameters\
      <input type="hidden" name="text['+child.id+']" id="t'+child.id+'" \>';
  parNode.appendChild(child);
  //console.log(tree);
  return child.id;
}

/*	Function: condChange
	Input: nodeId, index ID of the affected input node
	Description: Toggle the parameter input field.
*/
function condChange(nodeId)
{
	var condNode = document.getElementById('t'+nodeId);
	if (condNode.type == "hidden")
		condNode.type = "text";
	else
		condNode.type = "hidden";
		
}

/*	Function: removeSubChild
	Input: nodeId, index ID of the affected input node
	Description: Remove a node from the structure.
*/
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

/*	Function: hasSubFields
	Input: nodeId, index ID of the affected input node
	Description: Returns the number of child nodes a parent has.
*/
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

/*	Function: printJSON
	Input: 
	Description: Displays the current tree structure in d3.js as either a horizontal tree
		(results.html) or a collapsible menu structure (results2.html). Data is
		temporarily stored in temp.json.
*/
function printJSON()
{
  saveJSONfile("temp");
  window.open("http://www.robrehrig.com/web/display.html");
  //window.open("http://www.robrehrig.com/testing/results.html");
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
    console.log(data);
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
        if (fileData.substr(dataIndex,2) == ' {') {
        	dataIndex += 2;
        	tempStr = '';
        	while(fileData.charAt(dataIndex) != '}') {
        		tempStr += fileData.charAt(dataIndex);
        		dataIndex++;
        	}
        	document.getElementById('cond'+childId).checked = true;
        	document.getElementById('t'+childId).value = tempStr;
        	document.getElementById('t'+childId).type = "text";
        }
        else if (fileData.substr(dataIndex,2) == ' (') {
        	dataIndex += 2;
        	tempStr = '';
        	while(fileData.charAt(dataIndex) != ')') {
        		tempStr += fileData.charAt(dataIndex);
        		dataIndex++;
        	}
        	document.getElementById('n'+childId).value = tempStr;
        	document.getElementById('n'+childId).type = "text";
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

/*	Function: isValidFile
	Input: fileName, name of searched file
	Description: Checks to make sure the file exists by detecting a 404 error
*/
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
  	JSONstr += ' (' + document.getElementById('n'+nodeId).value + ')';
  	if (document.getElementById('cond'+nodeId).checked == true)
  		JSONstr += ' {' + document.getElementById('t'+nodeId).value + '}';
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