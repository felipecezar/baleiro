'use strict';

const BALEIRO_SERVICE_UUID = '0000aa00-0000-1000-8000-00805f9b34fb';
const WRITE_CHARACTERISTICS_UUID = '0000aa01-0000-1000-8000-00805f9b34fb';

document.addEventListener('WebComponentsReady', () => {
  let connectToggle = document.querySelector('#connect');
  let progress = document.querySelector('#progress');
  let dialog = document.querySelector('#dialog');
  let botaoCompra = document.querySelector('#btCompra');
  let gattServer;
  let baleiroService;
  let writeCharacteristic;
  let busy = false;
  progress.hidden = true;
  /**
   * Check if browser supports Web Bluetooth API.
   */
  if (navigator.bluetooth == undefined) {
    document.getElementById("no-bluetooth").style.display = "block";
    document.getElementById("no-bluetooth").open();
  }
  /**
   * Reset the app variable states.
   */
  function resetVariables() {
    busy = false;
    progress.hidden = true;
    gattServer = null;
    baleiroService = null;
    writeCharacteristic = null;
  }
  /**
   * API error handler.
   */
  function handleError(error) {
    console.log(error);
    resetVariables();
    dialog.open();
  }


  /**
   * Send a command to the car device.
   *
   * @param bytes The data containing the values.
   * @param offset The data offset within bytes.
   * @return short The data value.
   */
  function sendCommand(cmd) {
    if (writeCharacteristic) {
      // Handle one command at a time
      if (busy) {
        // Return if another operation pending
        return Promise.resolve();
      }
      busy = true;
      return writeCharacteristic.writeValue(cmd).then(() => {
        busy = false;
      });
    } else {
      return Promise.resolve();
    }
  }


  connectToggle.addEventListener('click', () => {

    console.log('Conectando...');
    progress.hidden = false;
    if (readCharacteristic == null) {
      navigator.bluetooth.requestDevice({
        filters: [{
          services: [BALEIRO_SERVICE_UUID]
        }]
      })
      .then(device => {
        console.log('Conectando ao servidor GATT...');
        return device.gatt.connect();
      })
      .then(server => {
        console.log('> Servidor GATT encontrado');
        gattServer = server;
        // Get car service
        return gattServer.getPrimaryService(BALEIRO_SERVICE_UUID);
      })
      .then(service => {
        console.log('> Serviço do baleiro encontrado');
        baleiroService = service;
        // Get write characteristic
        return baleiroService.getCharacteristic(WRITE_CHARACTERISTICS_UUID);
      })
      .then(characteristic => {
        console.log('> Caracteristica de escrira encontrada');
        writeCharacteristic = characteristic;
      })
      .catch(handleError);
    } else {
      progress.hidden = true;
    }

  });

  botaoCompra.addEventListener('click', function () {
    let encoder = new TextEncoder("utf8")
    let data = encoder.encode("DISPENSE")
    sendCommand(data)

  });
});
