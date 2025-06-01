# modelo.R
library(dplyr)
library(jsonlite)

clean_data <- function(data) {
  # Verifica os papéis únicos presentes nos dados
  papeis_unicos <- unique(data$Papel)
  
  # Define os níveis possíveis
  papeis_possiveis <- c("Líder", "Membro", "Coordenador")
  
  # Filtra apenas os papéis que existem nos dados
  papeis_presentes <- papeis_possiveis[papeis_possiveis %in% papeis_unicos]
  
  # Converte para fator apenas com os níveis presentes
  if(length(papeis_presentes) > 0) {
    data$Papel <- factor(data$Papel, levels = papeis_possiveis)
  } else {
    data$Papel <- factor(data$Papel)
  }
  
  # Processamento da frequência
  data$Frequencia <- factor(data$Frequencia,
                          levels = c("1x mês", "2x mês", "1x sem", "2x sem", "3x sem", 
                                     "4x sem", "1x dia", "2x dia", "3x dia"),
                          labels = c(1, 2, 4, 8, 12, 16, 21, 42, 63))
  
  # Ajuste das escalas
  data$Clareza <- data$Clareza - 3
  data$Objetividade <- data$Objetividade - 3
  data$Efetividade <- data$Efetividade - 3
  
  data
}

generate_nodes <- function(data) {
  # Verifica se a coluna Situacao existe antes de filtrar
  if("Situacao" %in% names(data)) {
    data <- data %>% filter(Situacao == "Trabalho")
  }
  
  # Seleciona colunas garantindo que existam
  colunas <- c("Pessoa", "Papel", "Frequencia", "Direcao", "Clareza", 
               "Objetividade", "Efetividade", "Comunicacao")
  colunas <- colunas[colunas %in% names(data)]
  
  data %>%
    select(all_of(colunas)) %>%
    distinct()
}

generate_edges <- function(data) {
  # Verifica se a coluna Situacao existe
  if("Situacao" %in% names(data)) {
    trabalho <- filter(data, Situacao == "Trabalho")
  } else {
    trabalho <- data
  }
  
  # Verifica se as colunas necessárias existem
  if(all(c("Pessoa", "Equipe") %in% names(trabalho))) {
    edges <- trabalho %>%
      select(Pessoa, Equipe) %>%
      inner_join(
        trabalho %>% select(Pessoa2 = Pessoa, Equipe2 = Equipe),
        by = c("Equipe" = "Equipe2"),
        relationship = "many-to-many"
      ) %>%
      filter(Pessoa != Pessoa2) %>%
      distinct()
    
    if(all(c("Frequencia") %in% names(trabalho))) {
      edges <- edges %>%
        left_join(trabalho %>% select(Pessoa, Frequencia), by = "Pessoa") %>%
        rename(Freq1 = Frequencia) %>%
        left_join(trabalho %>% select(Pessoa2 = Pessoa, Frequencia), by = "Pessoa2") %>%
        rename(Freq2 = Frequencia) %>%
        mutate(weight = (as.numeric(as.character(Freq1)) + as.numeric(as.character(Freq2))) / 2)
    }
    
    return(edges)
  } else {
    return(data.frame()) # Retorna dataframe vazio se não houver colunas necessárias
  }
}

export_graph_json <- function(nodes, edges) {
  if(nrow(nodes) == 0) {
    nodes <- data.frame(Pessoa = character(), stringsAsFactors = FALSE)
  }
  if(nrow(edges) == 0) {
    edges <- data.frame(Pessoa = character(), Pessoa2 = character(), stringsAsFactors = FALSE)
  }
  
  graph <- list(nodes = nodes, edges = edges)
  toJSON(graph, pretty = TRUE, auto_unbox = TRUE)
}

generate_from_dataframe <- function(data) {
  tryCatch({
    clean <- clean_data(data)
    nodes <- generate_nodes(clean)
    edges <- generate_edges(clean)
    export_graph_json(nodes, edges)
  }, error = function(e) {
    list(error = paste("Erro ao processar dados:", e$message))
  })
}