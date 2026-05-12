(function () {
	'use strict';
	if (window.__seiWidgetsResizerInstalled) return;
	window.__seiWidgetsResizerInstalled = true;

	function findIframe(source) {
		var frames = document.querySelectorAll('iframe');
		for (var i = 0; i < frames.length; i++) {
			try {
				if (frames[i].contentWindow === source) return frames[i];
			} catch (e) {}
		}
		return null;
	}

	window.addEventListener('message', function (e) {
		var data = e && e.data;
		if (!data || data.type !== 'sei-widget:resize') return;
		var h = Number(data.height);
		if (!isFinite(h) || h <= 0) return;
		var iframe = findIframe(e.source);
		if (!iframe) return;
		var next = Math.ceil(h) + 'px';
		if (iframe.style.height !== next) iframe.style.height = next;
		iframe.style.minHeight = '0px';
	});
})();
