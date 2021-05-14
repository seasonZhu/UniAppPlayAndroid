const PubFuc = {
	// 这个方法可能还是有点问题
	removeHtmlTag(title) {
		return title
		        .replace(/&ndash;/gi, "–")
		        .replace(/&mdash;/gi, "—")
		        .replace(/&lsquo;/gi, "‘")
		        .replace(/&rsquo;/gi, "’")
		        .replace(/&sbquo;/gi, "‚")
		        .replace(/&ldquo;/gi, "“")
		        .replace(/&rdquo;/gi, "”")
		        .replace(/&bdquo;/gi, "„")
		        .replace(/&permil;/gi, "‰")
		        .replace(/&lsaquo;/gi, "‹")
		        .replace(/&rsaquo;/gi, "›")
		        .replace(/&euro;/gi, "€")
		        .replace(/&lt;/gi, "<")
		        .replace(/i&gt;/gi, ">")
		        .replace(/&nbsp;/gi, " ")
		        .replace(/&amp;/gi, "&")
		        .replace(/&quot;/gi, "\"")
		        .replace(/&yen;/gi, "¥")
				.replace(/<\/?[^>]*>/g, '') //去除HTML Tag
				.replace(/[|]*\n/, '') //去除行尾空格
				.replace(/&nbsp;/gi, '');
	},
	formatDate(timeStamp) {
	  var date = new Date(timeStamp);
	  var y = date.getFullYear(),
	    m = date.getMonth() + 1,
	    d = date.getDate(),
	    h = date.getHours(),
	    i = date.getMinutes(),
	    s = date.getSeconds();
	  if (m < 10) { m = '0' + m; }
	  if (d < 10) { d = '0' + d; }
	  if (h < 10) { h = '0' + h; }
	  if (i < 10) { i = '0' + i; }
	  if (s < 10) { s = '0' + s; }
	  var t = y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;
	  return t;
	},
}

export default PubFuc