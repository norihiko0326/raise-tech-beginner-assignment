output "ec2_public_ip" {
  description = "EC2 の公開 IP アドレス"
  value       = aws_eip.app.public_ip
}

output "ec2_public_dns" {
  description = "EC2 の公開 DNS"
  value       = aws_instance.app.public_dns
}

output "rds_endpoint" {
  description = "RDS エンドポイント"
  value       = aws_db_instance.main.endpoint
}

output "rds_address" {
  description = "RDS ホストアドレス"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS ポート"
  value       = aws_db_instance.main.port
}

output "deployment_info" {
  description = "デプロイ情報"
  value = {
    frontend_url = "http://${aws_eip.app.public_ip}:3000"
    backend_url  = "http://${aws_eip.app.public_ip}:5000"
    api_health   = "http://${aws_eip.app.public_ip}:5000/health"
  }
}
