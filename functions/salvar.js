exports.salvarDB= function(client, origem, destino){
        client.collection(destino).replaceOne({},origem);
}
