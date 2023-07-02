const appearanceMode = localStorage.getItem('appearanceMode') || 'system'
document.body.classList.remove('system-mode', 'black-mode','dark-mode', 'light-mode')

document.body.classList.add(appearanceMode + '-mode')
