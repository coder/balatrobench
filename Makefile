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
	@$(PRINT) "$(BLUE)BalatroBot Development Makefile$(RESET)"
	@$(PRINT) ""
	@$(PRINT) "$(YELLOW)Available targets:$(RESET)"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "help"      "Show this help message"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "install"   "Install balatrobot and all dependencies (including dev)"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "lint"      "Run ruff linter (check only)"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "format"    "Run formatters (ruff, mdformat, stylua)"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "typecheck" "Run type checkers (Python and Lua)"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "quality"   "Run all code quality checks"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "test"      "Run Python test suite"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "all"       "Run all code quality checks and tests"
	@printf "  $(GREEN)%-18s$(RESET) %s\n" "coverage"  "Run tests with coverage report"

install: ## Install balatrobot and all dependencies (including dev)
	@$(PRINT) "$(YELLOW)Installing all dependencies...$(RESET)"
	uv sync --group dev --group test

lint: ## Run ruff linter (check only)
	@$(PRINT) "$(YELLOW)Running ruff linter...$(RESET)"
	ruff check --fix --select I .
	ruff check --fix .

format: ## Run formatters (ruff, mdformat, stylua)
	@$(PRINT) "$(YELLOW)Running ruff formatter...$(RESET)"
	ruff check --select I --fix .
	ruff format .
	@$(PRINT) "$(YELLOW)Running mdformat formatter...$(RESET)"
	mdformat README.md CLAUDE.md CONTRIBUTING.md

typecheck: ## Run type checkers (Python and Lua)
	@$(PRINT) "$(YELLOW)Running Python type checker...$(RESET)"
	@ty check

quality: lint typecheck format ## Run all code quality checks
	@$(PRINT) "$(GREEN)✓ All checks completed$(RESET)"

test: ## Run Python test suite
	@$(PRINT) "$(YELLOW)Running balatrobench tests...$(RESET)"
	@pytest

coverage: ## Run tests with coverage report
	@$(PRINT) "$(YELLOW)Running tests with coverage...$(RESET)"
	@pytest --cov=balatrobench --cov-report=term-missing --cov-report=html

all: lint format typecheck test ## Run all code quality checks and tests
	@$(PRINT) "$(GREEN)✓ All checks completed$(RESET)"
