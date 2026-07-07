variable "app_name" {
  description = "アプリケーション名"
  type        = string
  default     = "household-app"
}

variable "instance_type" {
  description = "EC2 インスタンスタイプ"
  type        = string
  default     = "t3.micro"
}

variable "db_instance_class" {
  description = "RDS インスタンスクラス"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "データベース名"
  type        = string
  default     = "householdapp"
}

variable "db_username" {
  description = "データベース管理者ユーザー名"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "データベース管理者パスワード"
  type        = string
  sensitive   = true
}

variable "ec2_key_name" {
  description = "EC2 キーペア名"
  type        = string
}

variable "github_repo_url" {
  description = "GitHub リポジトリ URL"
  type        = string
}

variable "github_branch" {
  description = "GitHub ブランチ"
  type        = string
  default     = "main"
}

variable "ec2_eip" {
  description = "EC2 の Elastic IP（フロントエンドビルド時に埋め込まれる）"
  type        = string
  default     = "13.159.246.229"
}
