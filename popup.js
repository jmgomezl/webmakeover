// Cuando la página de la extensión se carga, configuramos los listeners de los eventos
document.addEventListener('DOMContentLoaded', function() {
  // Escuchar el evento de cambio en el control de rango de zoom
  document.getElementById('zoomLevel').addEventListener('input', function() {
    // Aplicar el nivel de zoom a la página actual
    applyZoom(this.value);
  });

  // Escuchar el evento de cambio en el control de rango de tamaño de fuente
  document.getElementById('fontSize').addEventListener('input', function() {
    // Aplicar el tamaño de la fuente a la página actual
    applyFontSize(this.value);
  });

  // Escuchar el evento de cambio en el control de rango de espaciado de líneas
  document.getElementById('spacing').addEventListener('input', function() {
    // Aplicar el espaciado de líneas a la página actual
    applyLineSpacing(this.value);
  });

  // Escuchar el evento de entrada en el control de selección de color de fondo
  document.getElementById('backgroundColor').addEventListener('input', function() {
    // Aplicar el color de fondo a la página actual
    applyBackgroundColor(this.value);
  });

 // Escuchar el evento de entrada en el control de selección de color de texto
  document.getElementById('fontColor').addEventListener('input', function() {
    // Aplicar el color del texto a la página actual
    applyTextColor(this.value);
  });


  // Escuchar el evento de click en el botón de reseteo
  document.getElementById('reset').addEventListener('click', function() {
    // Restaurar los controles de rango a sus valores inicia
        // Restaurar los controles de rango a sus valores iniciales
        document.getElementById('zoomLevel').value = 100;
        document.getElementById('fontSize').value = 16;
        document.getElementById('spacing').value = 100;
        document.getElementById('backgroundColor').value = "#ffffff";
        document.getElementById('fontColor').value = "#000000";
    
        // Aplicar los cambios
        applyZoom(100);
        applyFontSize(16);
        applyLineSpacing(100);
        applyBackgroundColor("#ffffff");
        applyTextColor("#000000");
      });
    });
    
    function applyZoom(zoomLevel) {
      // Utilizamos la API de scripting para inyectar nuestro código en la pestaña activa
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: setZoom,
          args: [zoomLevel]
        });
      });
    }
    
    function applyFontSize(fontSize) {
      // Utilizamos la API de scripting para inyectar nuestro código en la pestaña activa
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: setFontSize,
          args: [fontSize]
        });
      });
    }
    
    function applyLineSpacing(spacing) {
      // Utilizamos la API de scripting para inyectar nuestro código en la pestaña activa
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: setLineSpacing,
          args: [spacing]
        });
      });
    }
    
    function applyBackgroundColor(color) {
      // Utilizamos la API de scripting para inyectar nuestro código en la pestaña activa
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: setBackgroundColor,
          args: [color]
        });
      });
    }
    
    function applyTextColor(color) {
      // Utilizamos la API de scripting para inyectar nuestro código en la pestaña activa
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: setTextColor,
          args: [color]
        });
      });
    }
    
    function setZoom(zoomLevel) {
      document.body.style.zoom = zoomLevel + "%";
    }
    
    function setFontSize(fontSize) {
      // Recorrer todos los elementos
      var elements = document.getElementsByTagName('*');
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.fontSize = fontSize + "px";
      }
    }
    
    function setLineSpacing(spacing) {
      // Recorrer todos los elementos
      var elements = document.getElementsByTagName('*');
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.lineHeight = spacing + "%";
      }
    }
    
    function setBackgroundColor(color) {
      document.body.style.backgroundColor = color;
    }
    
    function setTextColor(color) {
      // Recorrer todos los elementos
      var elements = document.getElementsByTagName('*');
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.color = color;
      }
    }
  

    
    


