function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var eventId = (e.parameter.eventId || "").trim().toUpperCase();
  
  // 1. Busca de Configurações
  var config = {};
  var configSheet = ss.getSheetByName('Configs');
  if (configSheet) {
    var cfgData = configSheet.getDataRange().getValues();
    for (var i = 1; i < cfgData.length; i++) {
       if (String(cfgData[i][0]).trim().toUpperCase() === eventId) {
         try { config = JSON.parse(cfgData[i][1]); } catch(err) { config = {}; }
         break;
       }
    }
  }

  // 2. Busca de Fotos e Senha
  var photos = [];
  var storedPassword = "";
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toUpperCase() === eventId) {
      if (!storedPassword && data[i][4]) storedPassword = String(data[i][4]).trim();
      
      photos.push({
        imageUrl: data[i][1],
        userName: data[i][2],
        Timestamp: data[i][3]
      });
    }
  }
  
  var result = {
    photos: photos,
    password: storedPassword,
    config: config
  };

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}


function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var params = JSON.parse(e.postData.contents);
  
  // Ação: Salvar Configuração (Cores, Fontes, Descrição)
  if (params.action === 'saveConfig') {
    var configSheet = ss.getSheetByName('Configs') || ss.insertSheet('Configs');
    if (configSheet.getLastRow() == 0) configSheet.appendRow(['EventID', 'JSON_Config']);
    
    var data = configSheet.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == params.eventId) {
        configSheet.getRange(i+1, 2).setValue(JSON.stringify(params.config));
        found = true;
        break;
      }
    }
    if (!found) configSheet.appendRow([params.eventId, JSON.stringify(params.config)]);
    return ContentService.createTextOutput("OK");
  }
  
  // Ação: Excluir Foto
  if (params.action === 'delete') {
    var data = sheet.getDataRange().getValues();
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][1] === params.imageUrl && data[i][2] === params.userName) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return ContentService.createTextOutput("OK");
  }

  // Fluxo Padrão: Salvar nova foto
  // Ordem: A: eventId, B: imageUrl, C: userName, D: Timestamp, E: password
  sheet.appendRow([
    params.eventId, 
    params.imageUrl, 
    params.userName, 
    new Date(), 
    params.password
  ]);
  
  return ContentService.createTextOutput("OK");
}
