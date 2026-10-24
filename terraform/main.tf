terraform {
  required_version = ">= 1.5.0"
  required_providers {
    github = {
      source  = "integrations/github"
      version = "6.6.0"
    }
  }
}

provider "github" {
  owner = "JosephMzp"
}

data "github_user" "self" {
  username = "JosephMzp"
}

# 1. Ambiente DEV
resource "github_repository_environment" "dev" {
  repository  = "demo-cicd"
  environment = "dev"
}

# 2. Ambiente STAGING
resource "github_repository_environment" "staging" {
  repository          = "demo-cicd"
  environment         = "staging"
  prevent_self_review = false

  reviewers {
    users = [data.github_user.self.id]
  }
}

# 3. Ruleset de protección de la rama main
resource "github_repository_ruleset" "main_protection" {
  name        = "Proteger main"
  repository  = "demo-cicd"
  target      = "branch"
  enforcement = "active"

  bypass_actors {
    actor_id    = 5 # RepositoryRole: Admin (ID 5 en GitHub)
    actor_type  = "RepositoryRole"
    bypass_mode = "always"
  }

  conditions {
    ref_name {
      include = ["~DEFAULT_BRANCH"]
      exclude = []
    }
  }

  rules {
    deletion         = true
    non_fast_forward = true

    pull_request {
      required_approving_review_count   = 0
      dismiss_stale_reviews_on_push     = false
      require_code_owner_review         = false
      require_last_push_approval        = false
      required_review_thread_resolution = false
    }

    required_status_checks {
      strict_required_status_checks_policy = false

      required_check {
        context        = "1. Lint (ESLint, HTMLHint, Hadolint)"
        integration_id = 15368
      }
      required_check {
        context        = "2. SAST (Semgrep) y secretos (Gitleaks)"
        integration_id = 15368
      }
      required_check {
        context        = "3. Pruebas unitarias y del sitio"
        integration_id = 15368
      }
      required_check {
        context        = "4. Pruebas de integración (Compose)"
        integration_id = 15368
      }
      required_check {
        context        = "5. Empaquetar y publicar (api)"
        integration_id = 15368
      }
      required_check {
        context        = "5. Empaquetar y publicar (db)"
        integration_id = 15368
      }
      required_check {
        context        = "5. Empaquetar y publicar (web)"
        integration_id = 15368
      }
      required_check {
        context        = "6. Escaneo de imagen (api)"
        integration_id = 15368
      }
      required_check {
        context        = "6. Escaneo de imagen (db)"
        integration_id = 15368
      }
      required_check {
        context        = "6. Escaneo de imagen (web)"
        integration_id = 15368
      }
    }
  }
}