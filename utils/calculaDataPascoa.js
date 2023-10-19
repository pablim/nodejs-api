module.exports = function calculaDataPascoa(ano) {

    var a = ano % 19
    var b = parseInt(ano / 100)
    var c = ano % 100
    var d = parseInt(b / 4)
    var e = b % 4
    var f = parseInt((b + 8) / 25)
    var g = parseInt((b - f + 1) / 3)
    var h = (19 * a + b - d - g + 15) % 30
    var i = parseInt(c / 4)
    var k = c % 4
    var L = (32 + 2 * e + 2 * i - h - k) % 7
    var m = parseInt((a + 11 * h + 22 * L) / 451)
    var mes = parseInt((h + L - 7 * m + 114) / 31)
    var dia = 1+ (h + L - 7 * m + 114) % 31
  
    mes = mes.toString()
    dia = dia.toString()
  
    if (mes.length == 1) mes = "0" + mes
    if (dia.length == 1) dia = "0" + dia
  
    return ano + "-" + mes + "-" + dia
  }