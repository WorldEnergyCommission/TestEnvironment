locals {
  zone = "at-vie-1"
}

terraform {
  required_providers {
    exoscale = {
      source  = "exoscale/exoscale"
      version = "0.60.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "5.67.0"
    }
  }
  required_version = "1.5.7"
}

provider "exoscale" {
  key    = var.exoscale_api_key
  secret = var.exoscale_secret_key
}

resource "exoscale_sks_cluster" "efficientio_sks_cluster" {
  zone           = local.zone
  name           = "${var.exoscale_cluster_name}_sks_cluster"
  auto_upgrade   = "false"
  exoscale_ccm   = "true"
  metrics_server = "true"
  service_level  = "pro"
  version        = "1.31.13"
}

resource "exoscale_security_group" "efficientio_security_group" {
  name = "${var.exoscale_cluster_name}_security_group"
}

resource "exoscale_security_group_rule" "efficientio_sks_kubelet_security_group_rule" {
  security_group_id = exoscale_security_group.efficientio_security_group.id
  type              = "INGRESS"
  protocol          = "TCP"
  cidr              = "0.0.0.0/0"
  start_port        = 10250
  end_port          = 10250
}

resource "exoscale_security_group_rule" "efficientio_nodeport_services_security_group_rule" {
  security_group_id = exoscale_security_group.efficientio_security_group.id
  type              = "INGRESS"
  protocol          = "TCP"
  cidr              = "0.0.0.0/0"
  start_port        = 30000
  end_port          = 32767
}

resource "exoscale_security_group_rule" "efficientio_calico_traffic_security_group_rule" {
  security_group_id = exoscale_security_group.efficientio_security_group.id
  type              = "INGRESS"
  protocol          = "UDP"
  cidr              = "0.0.0.0/0"
  start_port        = 4789
  end_port          = 4789
}

resource "exoscale_security_group" "ads_over_mqtt_security_group" {
  name = "${var.exoscale_cluster_name}_ads_over_mqtt_security_group"
}

resource "exoscale_security_group_rule" "ads_over_mqtt_security_group_rule" {
  security_group_id = exoscale_security_group.ads_over_mqtt_security_group.id
  type              = "INGRESS"
  protocol          = "TCP"
  cidr              = "0.0.0.0/0"
  start_port        = 8883
  end_port          = 8883
}

resource "exoscale_security_group" "ssh_access_security_group" {
  name = "${var.exoscale_cluster_name}_ssh_access_security_group"
}

resource "exoscale_security_group_rule" "ssh_access_security_group_rule" {
  security_group_id = exoscale_security_group.ssh_access_security_group.id
  type              = "INGRESS"
  protocol          = "TCP"
  cidr              = "0.0.0.0/0"
  start_port        = 22
  end_port          = 22
}

resource "exoscale_security_group" "rdp_access_security_group" {
  name = "${var.exoscale_cluster_name}_rdp_access_security_group"
}

resource "exoscale_security_group_rule" "rdp_access_security_group_rule" {
  security_group_id = exoscale_security_group.rdp_access_security_group.id
  type              = "INGRESS"
  protocol          = "TCP"
  cidr              = "0.0.0.0/0"
  start_port        = 3389
  end_port          = 3389
}

resource "exoscale_private_network" "efficientio_private_network" {
  zone = local.zone
  name = "${var.exoscale_cluster_name}_private_network"
}

resource "exoscale_sks_nodepool" "efficientio_huge_sks_nodepool" {
  cluster_id         = exoscale_sks_cluster.efficientio_sks_cluster.id
  zone               = local.zone
  name               = "${var.exoscale_cluster_name}_huge_sks_nodepool"
  instance_type      = var.exoscale_huge_sks_nodepool_instance_type
  size               = var.exoscale_huge_sks_nodepool_size
  disk_size          = 400
  security_group_ids = [
    exoscale_security_group.efficientio_security_group.id
  ]
}

resource "exoscale_sks_nodepool" "efficientio_large_sks_nodepool" {
  cluster_id         = exoscale_sks_cluster.efficientio_sks_cluster.id
  zone               = local.zone
  name               = "${var.exoscale_cluster_name}_large_sks_nodepool"
  instance_type      = "standard.large"
  size               = 2
  disk_size          = 400
  security_group_ids = [
    exoscale_security_group.efficientio_security_group.id
  ]
}


provider "aws" {
  endpoints {
    s3 = "https://sos-${local.zone}.exo.io"
  }
  region                      = local.zone
  access_key                  = var.exoscale_api_key
  secret_key                  = var.exoscale_secret_key
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
  skip_region_validation      = true
}

resource "aws_s3_bucket" "efficientio-s3-bucket" {
  bucket = "efficientio-${var.exoscale_cluster_name}-s3-bucket"
}

resource "aws_s3_bucket" "backup-s3-bucket" {
  bucket = "backup-${var.exoscale_cluster_name}-s3-bucket"
}

resource "exoscale_iam_role" "efficientio_s3_buckets_role" {
  name        = "${var.exoscale_cluster_name}_s3_buckets_role"
  description = "${var.exoscale_cluster_name}_s3_buckets_role"
  editable    = false
  policy      = {
    default_service_strategy = "deny"
    services                 = {
      sos = {
        type = "allow"
      }
    }
  }
}

resource "exoscale_iam_api_key" "efficientio_s3_buckets_access_key" {
  name    = "${var.exoscale_cluster_name}_s3_buckets_access_key"
  role_id = exoscale_iam_role.efficientio_s3_buckets_role.id
}

resource "exoscale_sks_kubeconfig" "efficientio_sks_cluster" {
  cluster_id  = exoscale_sks_cluster.efficientio_sks_cluster.id
  zone        = exoscale_sks_cluster.efficientio_sks_cluster.zone
  user        = "kubernetes-admin"
  groups      = ["system:masters"]
  ttl_seconds = 315360000
}
