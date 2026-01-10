.DEFAULT_GOAL := help
.PHONY: help install lint format typecheck quality test coverage all

# Colors (ANSI)
YELLOW := \033[33m
GREEN  := \033[32m
BLUE   := \033[34m
RED    := \033[31m
RESET  := \033[0m

# Print helper
PRINT = printf "%b\n"

help: ## Show this help message
	@$(PRINT) "$(BLUE)BalatroBench Development Makefile$(RESET)"
	@$(PRINT) ""
	@$(PRINT) "$(YELLOW)Available targets:$(RESET)"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "help"      "Show this help message"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "install"   "Install balatrobench and all dependencies (Python + npm)"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "lint"      "Run ruff linter (check only)"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "format"    "Run formatters (ruff, mdformat, js-beautify)"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "typecheck" "Run type checkers (Python and Lua)"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "quality"   "Run all code quality checks"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "test"      "Run Python and site test suites"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "all"       "Run all code quality checks and tests"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "coverage"  "Run tests with coverage report"

install: ## Install balatrobench and all dependencies (Python + npm)
	@$(PRINT) "$(YELLOW)Installing Python dependencies...$(RESET)"
	uv sync --group dev --group test
	@$(PRINT) "$(YELLOW)Installing npm dependencies...$(RESET)"
	npm install

lint: ## Run ruff linter (check only)
	@$(PRINT) "$(YELLOW)Running ruff linter...$(RESET)"
	ruff check --fix --select I .
	ruff check --fix .

format: ## Run formatters (ruff, mdformat, js-beautify)
	@$(PRINT) "$(YELLOW)Running ruff formatter...$(RESET)"
	ruff check --select I --fix .
	ruff format .
	@$(PRINT) "$(YELLOW)Running mdformat formatter...$(RESET)"
	mdformat README.md CLAUDE.md CONTRIBUTING.md
	@$(PRINT) "$(YELLOW)Running js-beautify formatter...$(RESET)"
	html-beautify --replace --editorconfig site/*.html
	js-beautify --replace --editorconfig site/*.js
	js-beautify --replace --editorconfig site/benchmarks/**/*.json

typecheck: ## Run type checkers (Python and Lua)
	@$(PRINT) "$(YELLOW)Running Python type checker...$(RESET)"
	@ty check

quality: lint typecheck format ## Run all code quality checks
	@$(PRINT) "$(GREEN)✓ All checks completed$(RESET)"

test: ## Run Python and site test suites
	@$(PRINT) "$(YELLOW)Running balatrobench tests...$(RESET)"
	@pytest
	@$(PRINT) "$(YELLOW)Running site tests...$(RESET)"
	@npm test

coverage: ## Run tests with coverage report
	@$(PRINT) "$(YELLOW)Running tests with coverage...$(RESET)"
	@pytest --cov=balatrobench --cov-report=term-missing --cov-report=html

all: lint format typecheck test ## Run all code quality checks and tests
	@$(PRINT) "$(GREEN)✓ All checks completed$(RESET)"
