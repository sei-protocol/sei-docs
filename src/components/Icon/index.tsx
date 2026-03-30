const ICONS: Record<string, string> = {
	'arrow-right': '<path d="M5 12l14 0"></path><path d="M13 18l6 -6"></path><path d="M13 6l6 6"></path>',
	'arrows-exchange': '<path d="M7 10h14l-4 -4"></path><path d="M17 14h-14l4 4"></path>',
	'arrows-shuffle':
		'<path d="M18 4l3 3l-3 3"></path><path d="M18 20l3 -3l-3 -3"></path><path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5"></path><path d="M21 7h-5a4.978 4.978 0 0 0 -3 1m-4 8a4.984 4.984 0 0 1 -3 1h-3"></path>',
	'arrows-shuffle-2':
		'<path d="M18 4l3 3l-3 3"></path><path d="M18 20l3 -3l-3 -3"></path><path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5"></path><path d="M3 17h3a5 5 0 0 0 5 -5a5 5 0 0 1 5 -5h5"></path>',
	'alert-circle': '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path>',
	'alert-triangle':
		'<path d="M12 9v4"></path><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0"></path><path d="M12 16h.01"></path>',
	bolt: '<path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11"></path>',
	book: '<path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path><path d="M3 6l0 13"></path><path d="M12 6l0 13"></path><path d="M21 6l0 13"></path>',
	brain:
		'<path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8"></path><path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8"></path><path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5"></path><path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0"></path><path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5"></path><path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10"></path>',
	'building-bridge':
		'<path d="M6 5l0 14"></path><path d="M18 5l0 14"></path><path d="M2 15l20 0"></path><path d="M3 8a7.5 7.5 0 0 0 3 -2a6.5 6.5 0 0 0 12 0a7.5 7.5 0 0 0 3 2"></path><path d="M12 10l0 5"></path>',
	'chart-bar':
		'<path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6"></path><path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10"></path><path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14"></path><path d="M4 20h14"></path>',
	'chart-line': '<path d="M4 19l16 0"></path><path d="M4 15l4 -6l4 2l4 -5l4 4"></path>',
	check: '<path d="M5 12l5 5l10 -10"></path>',
	checklist:
		'<path d="M9.615 20h-2.615a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8"></path><path d="M14 19l2 2l4 -4"></path><path d="M9 8h4"></path><path d="M9 12h2"></path>',
	'chevron-right': '<path d="M9 6l6 6l-6 6"></path>',
	'clipboard-text':
		'<path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"></path><path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2"></path><path d="M9 12h6"></path><path d="M9 16h6"></path>',
	clock: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path d="M12 7v5l3 3"></path>',
	code: '<path d="M7 8l-4 4l4 4"></path><path d="M17 8l4 4l-4 4"></path><path d="M14 4l-4 16"></path>',
	coin: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1"></path><path d="M12 7v10"></path>',
	coins:
		'<path d="M9 14c0 1.657 2.686 3 6 3s6 -1.343 6 -3s-2.686 -3 -6 -3s-6 1.343 -6 3"></path><path d="M9 14v4c0 1.656 2.686 3 6 3s6 -1.344 6 -3v-4"></path><path d="M3 6c0 1.072 1.144 2.062 3 2.598s4.144 .536 6 0c1.856 -.536 3 -1.526 3 -2.598c0 -1.072 -1.144 -2.062 -3 -2.598s-4.144 -.536 -6 0c-1.856 .536 -3 1.526 -3 2.598"></path><path d="M3 6v10c0 .888 .772 1.45 2 2"></path><path d="M3 11c0 .888 .772 1.45 2 2"></path>',
	'credit-card':
		'<path d="M3 8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -8"></path><path d="M3 10l18 0"></path><path d="M7 15l.01 0"></path><path d="M11 15l2 0"></path>',
	cpu: '<path d="M5 6a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -12"></path><path d="M9 9h6v6h-6l0 -6"></path><path d="M3 10h2"></path><path d="M3 14h2"></path><path d="M10 3v2"></path><path d="M14 3v2"></path><path d="M21 10h-2"></path><path d="M21 14h-2"></path><path d="M14 21v-2"></path><path d="M10 21v-2"></path>',
	database: '<path d="M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0"></path><path d="M4 6v6a8 3 0 0 0 16 0v-6"></path><path d="M4 12v6a8 3 0 0 0 16 0v-6"></path>',
	'device-desktop':
		'<path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10"></path><path d="M7 20h10"></path><path d="M9 16v4"></path><path d="M15 16v4"></path>',
	'device-mobile':
		'<path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14"></path><path d="M11 4h2"></path><path d="M12 17v.01"></path>',
	download: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path><path d="M7 11l5 5l5 -5"></path><path d="M12 4l0 12"></path>',
	droplet:
		'<path d="M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0c2.602 -2.105 3.262 -5.708 1.566 -8.546l-4.89 -7.26c-.42 -.625 -1.287 -.803 -1.936 -.397a1.376 1.376 0 0 0 -.41 .397l-4.893 7.26c-1.695 2.838 -1.035 6.441 1.567 8.546"></path>',
	'external-link': '<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path><path d="M11 13l9 -9"></path><path d="M15 4h5v5"></path>',
	eye: '<path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"></path>',
	'file-text':
		'<path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"></path><path d="M9 9l1 0"></path><path d="M9 13l6 0"></path><path d="M9 17l6 0"></path>',
	'gas-station':
		'<path d="M14 11h1a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0v-7l-3 -3"></path><path d="M4 20v-14a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v14"></path><path d="M3 20l12 0"></path><path d="M18 7v1a1 1 0 0 0 1 1h1"></path><path d="M4 11l10 0"></path>',
	gauge:
		'<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M13.41 10.59l2.59 -2.59"></path><path d="M7 12a5 5 0 0 1 5 -5"></path>',
	gavel:
		'<path d="M13 10l7.383 7.418c.823 .82 .823 2.148 0 2.967a2.11 2.11 0 0 1 -2.976 0l-7.407 -7.385"></path><path d="M6 9l4 4"></path><path d="M13 10l-4 -4"></path><path d="M3 21h7"></path><path d="M6.793 15.793l-3.586 -3.586a1 1 0 0 1 0 -1.414l2.293 -2.293l.5 .5l3 -3l-.5 -.5l2.293 -2.293a1 1 0 0 1 1.414 0l3.586 3.586a1 1 0 0 1 0 1.414l-2.293 2.293l-.5 -.5l-3 3l.5 .5l-2.293 2.293a1 1 0 0 1 -1.414 0"></path>',
	hexagons: '<path d="M4 18v-5l4 -2l4 2v5l-4 2l-4 -2"></path><path d="M8 11v-5l4 -2l4 2v5"></path><path d="M12 13l4 -2l4 2v5l-4 2l-4 -2"></path>',
	hourglass:
		'<path d="M6.5 7h11"></path><path d="M6.5 17h11"></path><path d="M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1"></path><path d="M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1"></path>',
	'info-circle': '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path d="M12 9h.01"></path><path d="M11 12h1v4h1"></path>',
	key: '<path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0"></path><path d="M15 9h.01"></path>',
	'layout-dashboard':
		'<path d="M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1"></path><path d="M5 16h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1"></path><path d="M15 12h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1"></path><path d="M15 4h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1"></path>',
	'loader-2': '<path d="M12 3a9 9 0 1 0 9 9"></path>',
	lock: '<path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6"></path><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path><path d="M8 11v-4a4 4 0 1 1 8 0v4"></path>',
	'lock-open':
		'<path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -6"></path><path d="M11 16a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M8 11v-5a4 4 0 0 1 8 0"></path>',
	network:
		'<path d="M6 9a6 6 0 1 0 12 0a6 6 0 0 0 -12 0"></path><path d="M12 3c1.333 .333 2 2.333 2 6s-.667 5.667 -2 6"></path><path d="M12 3c-1.333 .333 -2 2.333 -2 6s.667 5.667 2 6"></path><path d="M6 9h12"></path><path d="M3 20h7"></path><path d="M14 20h7"></path><path d="M10 20a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path><path d="M12 15v3"></path>',
	note: '<path d="M13 20l7 -7"></path><path d="M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7"></path>',
	package:
		'<path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5"></path><path d="M12 12l8 -4.5"></path><path d="M12 12l0 9"></path><path d="M12 12l-8 -4.5"></path><path d="M16 5.25l-8 4.5"></path>',
	plug: '<path d="M9.785 6l8.215 8.215l-2.054 2.054a5.81 5.81 0 1 1 -8.215 -8.215l2.054 -2.054"></path><path d="M4 20l3.5 -3.5"></path><path d="M15 4l-3.5 3.5"></path><path d="M20 9l-3.5 3.5"></path>',
	plus: '<path d="M12 5l0 14"></path><path d="M5 12l14 0"></path>',
	receipt: '<path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2m4 -14h6m-6 4h6m-2 4h2"></path>',
	refresh: '<path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>',
	rocket:
		'<path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"></path><path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"></path><path d="M14 9a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>',
	robot:
		'<path d="M6 6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -4"></path><path d="M12 2v2"></path><path d="M9 12v9"></path><path d="M15 12v9"></path><path d="M5 16l4 -2"></path><path d="M15 14l4 2"></path><path d="M9 18h6"></path><path d="M10 8v.01"></path><path d="M14 8v.01"></path>',
	school: '<path d="M22 9l-10 -4l-10 4l10 4l10 -4v6"></path><path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4"></path>',
	send: '<path d="M10 14l11 -11"></path><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"></path>',
	server:
		'<path d="M3 7a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3"></path><path d="M3 15a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -2"></path><path d="M7 8l0 .01"></path><path d="M7 16l0 .01"></path>',
	settings:
		'<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065"></path><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>',
	'settings-automation':
		'<path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065"></path><path d="M10 9v6l5 -3l-5 -3"></path>',
	shield: '<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"></path>',
	'shield-check':
		'<path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06"></path><path d="M15 19l2 2l4 -4"></path>',
	'shield-lock':
		'<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"></path><path d="M11 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M12 12l0 2.5"></path>',
	target:
		'<path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M7 12a5 5 0 1 0 10 0a5 5 0 1 0 -10 0"></path><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>',
	'terminal-2':
		'<path d="M8 9l3 3l-3 3"></path><path d="M13 15l3 0"></path><path d="M3 6a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -12"></path>',
	'test-pipe':
		'<path d="M20 8.04l-12.122 12.124a2.857 2.857 0 1 1 -4.041 -4.04l12.122 -12.124"></path><path d="M7 13h8"></path><path d="M19 15l1.5 1.6a2 2 0 1 1 -3 0l1.5 -1.6"></path><path d="M15 3l6 6"></path>',
	tools:
		'<path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4"></path><path d="M14.5 5.5l4 4"></path><path d="M12 8l-5 -5l-4 4l5 5"></path><path d="M7 8l-1.5 1.5"></path><path d="M16 12l5 5l-4 4l-5 -5"></path><path d="M16 17l-1.5 1.5"></path>',
	upload: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path><path d="M7 9l5 -5l5 5"></path><path d="M12 4l0 12"></path>',
	'user-circle':
		'<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"></path>',
	users:
		'<path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"></path>',
	'users-group':
		'<path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path><path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1"></path><path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path><path d="M17 10h2a2 2 0 0 1 2 2v1"></path><path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path><path d="M3 13v-1a2 2 0 0 1 2 -2h2"></path>',
	wallet:
		'<path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12"></path><path d="M20 12v4h-4a2 2 0 0 1 0 -4h4"></path>',
	wand: '<path d="M6 21l15 -15l-3 -3l-15 15l3 3"></path><path d="M15 6l3 3"></path><path d="M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"></path><path d="M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"></path>',
	world:
		'<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path d="M3.6 9h16.8"></path><path d="M3.6 15h16.8"></path><path d="M11.5 3a17 17 0 0 0 0 18"></path><path d="M12.5 3a17 17 0 0 1 0 18"></path>',
	'world-www':
		'<path d="M19.5 7a9 9 0 0 0 -7.5 -4a8.991 8.991 0 0 0 -7.484 4"></path><path d="M11.5 3a16.989 16.989 0 0 0 -1.826 4"></path><path d="M12.5 3a16.989 16.989 0 0 1 1.828 4"></path><path d="M19.5 17a9 9 0 0 1 -7.5 4a8.991 8.991 0 0 1 -7.484 -4"></path><path d="M11.5 21a16.989 16.989 0 0 1 -1.826 -4"></path><path d="M12.5 21a16.989 16.989 0 0 0 1.828 -4"></path><path d="M2 10l1 4l1.5 -4l1.5 4l1 -4"></path><path d="M17 10l1 4l1.5 -4l1.5 4l1 -4"></path><path d="M9.5 10l1 4l1.5 -4l1.5 4l1 -4"></path>'
};

interface IconProps {
	icon: string;
	className?: string;
	size?: number;
	color?: string;
}

export function Icon({ icon, className, size, color }: IconProps) {
	const paths = ICONS[icon];
	if (!paths) {
		console.warn(`Icon "${icon}" not found`);
		return null;
	}

	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width={size || 24}
			height={size || 24}
			viewBox='0 0 24 24'
			fill='none'
			stroke={color || 'currentColor'}
			strokeWidth={2}
			strokeLinecap='round'
			strokeLinejoin='round'
			className={className}
			dangerouslySetInnerHTML={{ __html: paths }}
		/>
	);
}
