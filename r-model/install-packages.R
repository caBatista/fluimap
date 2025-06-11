packages <- c("plumber", "dplyr" /*, add other required packages here */)
install_if_missing <- function(pkg) {
  if (!require(pkg, character.only = TRUE)) {
    install.packages(pkg, repos = "https://cloud.r-project.org")
  }
}
invisible(lapply(packages, install_if_missing))