setwd("r-model")  
library(plumber)
pr("api.R") %>% pr_run(port = 8000) # porta onde a api vai funcionar
