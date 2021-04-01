const map = new Map();

module.exports.SetValue = function(value) {
	let data = value.split('<form name=')[1].split('</form>')[0];

	let paramsCount =
		(data.length - replaceAll(data, 'input', '').length) / 5;

	for (var i = 0; i < paramsCount; i++) {
		this.AddParameter (
			data.split ("name='")[i + 1].split ("'")[0],
			data.split ("value='")[i + 1].split ("'")[0]
		);
	}
};

module.exports.AddParameter = function(name, value) {
	map.set(name, value);
};

module.exports.GetParameter = function(name) {
	return map.get(name);
};

module.exports.GetValue = function() {
	var resValue = '';
	for (const [key, value] of map) {
		resValue = resValue + key + '=' + value + '&';
	}

	getValue = resValue.substr(0, resValue.length - 1);
	return getValue;
};

module.exports.Clear = function() {
	map.clear();
};

function replaceAll (str, searchStr, replaceStr) {
	return str.split (searchStr).join (replaceStr);
}
