function include_once(fileDirectory) {
	var div = document.createElement(div);
	div.innerHTML = '<object type="text/html" data="' + fileDirectory + '" ></object>';
    document.body.appendChild(div);
}
