source("modelo.R")
library(plumber)

#* gera o grafo a partir dos dados
#* @post /gerar-grafo
#* @serializer unboxedJSON
function(req) {
  tryCatch({
    # le o corpo do request como string JSON
    json_body <- req$postBody
    data <- jsonlite::fromJSON(json_body)

    # gera o grafo e retorna JSON string diretamente
    result_json <- generate_from_dataframe(data)

    # parseia novamente para lista R, pois plumber faz o JSON final
    result_list <- jsonlite::fromJSON(result_json)

    return(result_list)
  }, error = function(e) {
    list(error = e$message)
  })
}
