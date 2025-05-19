# modelo.R
library(dplyr)
library(jsonlite)

clean_data <- function(data) {
  data$Papel <- factor(data$Papel, labels = c("Líder", "Membro", "Coordenador"))
  data$Frequencia <- factor(data$Frequencia,
                            levels = c("1x mês", "2x mês", "1x sem", "2x sem", "3x sem", "4x sem", "1x dia", "2x dia", "3x dia"),
                            labels = c(1, 2, 4, 8, 12, 16, 21, 42, 63))
  data$Clareza <- data$Clareza - 3
  data$Objetividade <- data$Objetividade - 3
  data$Efetividade <- data$Efetividade - 3
  data
}

generate_nodes <- function(data) {
  data %>%
    filter(Situacao == "Trabalho") %>%
    select(Pessoa, Papel, Frequencia, Direcao, Clareza, Objetividade, Efetividade, Comunicacao) %>%
    distinct()
}

generate_edges <- function(data) {
  trabalho <- filter(data, Situacao == "Trabalho")
  
  edges <- trabalho %>%
    select(Pessoa, Equipe) %>%
    inner_join(
      trabalho %>% select(Pessoa2 = Pessoa, Equipe2 = Equipe),
      by = c("Equipe" = "Equipe2"),
      relationship = "many-to-many"
    ) %>%
    filter(Pessoa != Pessoa2) %>%
    distinct()

  
  edges <- edges %>%
    left_join(trabalho %>% select(Pessoa, Frequencia), by = c("Pessoa" = "Pessoa")) %>%
    rename(Freq1 = Frequencia) %>%
    left_join(trabalho %>% select(Pessoa2 = Pessoa, Frequencia), by = c("Pessoa2" = "Pessoa2")) %>%
    rename(Freq2 = Frequencia) %>%
    mutate(weight = (as.numeric(as.character(Freq1)) + as.numeric(as.character(Freq2))) / 2)
  
  edges
}

export_graph_json <- function(nodes, edges) {
  graph <- list(nodes = nodes, edges = edges)
  toJSON(graph, pretty = TRUE, auto_unbox = TRUE)
}

generate_from_dataframe <- function(data) {
  clean <- clean_data(data)
  nodes <- generate_nodes(clean)
  edges <- generate_edges(clean)
  export_graph_json(nodes, edges)
}
