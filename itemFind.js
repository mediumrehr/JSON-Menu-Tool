/*  
	Function: Search
	Input: ctlFn, Control function to search for
	Description: Initiates search for a function within selected devices based on the
		information in the saved menu structures. Also, does nothing if the control is set
		to none, such the case for 'none' option and any '- * -' options.
*/
function search(ctlFn)
{
	if(ctlFn != "none") {
		if(document.getElementById('axt400s').checked == 1)
			findItem(ctlFn,'axt400s');
		if(document.getElementById('ulxd4qs').checked == 1)
			findItem(ctlFn,'ulxd4qs');
		if(document.getElementById('p10ts').checked == 1)
			findItem(ctlFn,'p10ts');
		if(document.getElementById('p9ts').checked == 1)
			findItem(ctlFn,'p9ts');
		if(document.getElementById('ur4ss').checked == 1)
			findItem(ctlFn,'ur4ss');
	}
}

/*  
	Function: findItem
	Input: ctlFn, Control function to search for
		fileName, Name of file to search for control within
	Description: Makes an ajax call to retrieve <fileName>.json from the server and then
		search through the string for a ctlFn. Control functions are listed first within
		the strings, followed by the name of the control relative to the device in
		parentheses, and lastly the parameters of the control, if applicable, in curly
		brackets.
	Comment: A better way to do this searching would be to set up the system to be
		compatible with jquery.parse() by creating name/value pairs for each element
		(control function, device relative name, control parameters, and menu children),
		but there was not enough time to implement this method, as it was an afterthought.
*/
function findItem(ctlFn, fileName)
{
	// ajax call to retrieve <fileName>.json
	// Once retrieved, the string search is performed
	$.ajax({ 
		  url: "JSONdata/" + fileName + ".json",
		  dataType: "text"
		}).done(function ( data ) {
			var strLength = data.length - ctlFn.length;
			var dataIndex = 0; // String position during search
			var ctlsFound = 0; // Number of controls with search title found
			var depthIndex = 0;  // Depth within menu (dictated by curly brackets)
			var depth = new Array(); // Depth of control
			var printName = new Array(); // Device relative control name
			var printParam = new Array(); // Device control parameters
			var printParent = new Array(); // Names of control funtion parent menus
			
			// Search for control function only as long as the json string minus the size
			// of the search string.
			while (dataIndex < strLength) {
				// Menu items start with '{"' vs parameters which are just '{', so this
				// check distinguishes between the two.
				if ((data.charAt(dataIndex) == '{') && (data.charAt(dataIndex+1) == '"')) {
					// The first element is the name of the device and doesn't have any
					// parentheses or curly brackets, so skip that case since it will mess
					// up the search.
					if (depthIndex != 0) {
						printParent[depthIndex-1] = '';
						var tempIndex = dataIndex + 10; // skip '{"name": "' in the string
						// Store device relative name of the control aka the text within
						// the parentheses
						while (data.charAt(tempIndex) != '(')
							tempIndex++;
						tempIndex++;
						while (data.charAt(tempIndex) != ')') {
							printParent[depthIndex-1] += data.charAt(tempIndex);
							tempIndex++;
						}
					}
					depthIndex++; // Increase depth index since we came across a menu item
				}
				else if ((data.charAt(dataIndex) == '}') && (data.charAt(dataIndex-1) == '"')) {
					depthIndex--; // Decrease depth index since we came out of a menu item
				}
				else if ((data.charAt(dataIndex) == '}') && (data.charAt(dataIndex-1) == ']')) {
					depthIndex--; // Decrease depth index since we came out of a menu child
				}
				// Case in which the searched term has been found within a menu item
				else if (data.substr(dataIndex,ctlFn.length).toUpperCase() == ctlFn.toUpperCase()) {
					var startIndex = dataIndex;
					// Retrieve the full control function within quotes. Used when the
					// function search string is only part of the full control function
					// title.
					while (data.charAt(startIndex - 1) != '"')
						startIndex--;
					var endIndex = dataIndex + ctlFn.length;
					// Read over full menu string from " to "
					while (data.charAt(endIndex) != '"') {
						// Store device relative name of control
						if (data.charAt(endIndex) == "(") {
							var relCtlName = ''
							endIndex++;
							while (data.charAt(endIndex) != ")") {
								// convert <'s to html version
								if (data.charAt(endIndex) == '<')
									relCtlName += '&lt;';
								// convert >'s to html version
								else if (data.charAt(endIndex) == '>')
									relCtlName += '&gt;';
								else
									relCtlName += data.charAt(endIndex);
								endIndex++;
							}
							endIndex--;
							//console.log(relCtlName);
						}
						// Store device parameters, if any
						if (data.charAt(endIndex) == "{") {
							var itemParam = '';
							endIndex++;
							while (data.charAt(endIndex) != "}") {
								// convert <'s to html version
								if (data.charAt(endIndex) == '<')
									itemParam += '&lt;';
								// convert >'s to html version
								else if (data.charAt(endIndex) == '>')
									itemParam += '&gt;';
								else
									itemParam += data.charAt(endIndex);
								endIndex++;
							}
							endIndex--;
						}
						endIndex++;
					}
					printName[ctlsFound] = relCtlName;
					printParam[ctlsFound] = itemParam;
					depth[ctlsFound] = depthIndex - 1;
					ctlsFound++;
					dataIndex += (endIndex - startIndex) - 1;
				}
				dataIndex++;
				if (ctlsFound)
					break;
			}
			// Print results to page after clearing old results
			clearLastSearch(fileName);
			if(fileName == 'axt400s')
				var divName = 'axt';
			else if(fileName == 'ulxd4qs')
				var divName = 'ulxd';
			else if(fileName == 'p10ts')
				var divName = 'psm1000';
			else if(fileName == 'p9ts')
				var divName = 'psm900';
			else if(fileName == 'ur4ss')
				var divName = 'uhfr';
			// console.log(ctlsFound);
			if (ctlsFound) {
				var itemNameDiv = (document.createElement('div'));
				itemNameDiv.innerHTML = '<br><b>Name</b><br>' + printName[0] + '<br>';
				$('.' + divName).append(itemNameDiv);
			
				var parentMenus = (document.createElement('div'));
				parentMenus.innerHTML = '<br><b>Parent Menus (Depth: ' + depth[0] + ')</b><br>';
				for (j=0;j<depthIndex-2;j++)
					parentMenus.innerHTML += printParent[j] + '<br>';
				$('.' + divName).append(parentMenus);
			
				var itemDetails = (document.createElement('div'));
				if (printParam == '') printParam[0] = '&lt;none&gt;';
				itemDetails.innerHTML = '<br><b>Function</b><br>' + ctlFn + '<br><br><b>Parameters</b><br>' + printParam[0];
				$('.' + divName).append(itemDetails);
			}
			else {
				var itemNameDiv = (document.createElement('div'));
				itemNameDiv.innerHTML = '<br><b>Name</b><br>&lt;Not Found&gt;<br>';
				$('.' + divName).append(itemNameDiv);
			
				var itemDetails = (document.createElement('div'));
				if (printParam == '') printParam[0] = '&lt;none&gt;';
				itemDetails.innerHTML = '<br><b>Function</b><br>' + ctlFn + '<br>';
				$('.' + divName).append(itemDetails);
			}
		}
	)
}

/*  
	Function: ClearLastSearch
	Input: fileName, Name of file to search for control within
	Description: Clear results from last search in the displayed boxes.
*/
function clearLastSearch(fileName)
{
	if(fileName == 'axt400s') {
		$('.axt').empty(":contains('Item')");
		$('.axt').append('<b>AXT400</b>');
	}
	else if(fileName == 'ulxd4qs') {
		$('.ulxd').empty(":contains('Item')");
		$('.ulxd').append('<b>ULXD4Q</b>');
	}
	else if(fileName == 'p10ts') {
		$('.psm1000').empty(":contains('Item')");
		$('.psm1000').append('<b>P10T</b>');
	}
	else if(fileName == 'p9ts') {
		$('.psm900').empty(":contains('Item')");
		$('.psm900').append('<b>P9T</b>');
	}
	else if(fileName == 'ur4ss') {
		$('.uhfr').empty(":contains('Item')");
		$('.uhfr').append('<b>UR4S</b>');
	}
}