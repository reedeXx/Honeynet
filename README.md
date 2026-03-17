# Honeynet Management System

A comprehensive honeypot management platform for deploying, monitoring, and analyzing containerized honeypots through a web-based interface.

## Project Overview

This project provides a centralized system for managing multiple types of honeypots using Docker containerization. The system consists of a Flask web application that serves as an orchestration layer, a browser-based management interface, and various specialized honeypot services. 

### Key Features

- **Web-based Management**: Bootstrap-powered dark theme interface for easy deployment and monitoring Honeynet:44-162 
- **Multi-Protocol Support**: Manages honeypots for SSH/Telnet, DDoS detection, DICOM medical devices, WordPress, and database services
- **Container Orchestration**: Docker-based deployment with automated port mapping and volume management
- **Real-time Monitoring**: Live container status, log viewing, and configuration management

## Supported Honeypots

| Honeypot | Protocol | Ports | Purpose |
|----------|----------|-------|---------|
| Cowrie | SSH/Telnet | 2222, 2223 | Credential harvesting |
| DDOSpot | UDP Services | 19, 53, 123, 1900 | DDoS amplification detection |
| Dicompot | DICOM | 11112 | Medical device simulation |
| Wordpot | HTTP | 80 | WordPress attack simulation |
| Honeypots | Database | 1433, 3306, 5432, 6379, 27017, 1521 | Multi-database services |

### Deploying Honeypots

1. Open the web interface and click "Desplegar" (Deploy)
2. Select desired honeypots from the dropdown
3. Click "Desplegar" to deploy containers
4. Monitor deployment through the container list

## Architecture

The system follows a three-tier architecture: Honeynet:17-62 

- **Web Layer**: Bootstrap UI with JavaScript client
- **Application Layer**: Flask API server with Docker SDK integration
- **Container Layer**: Multiple specialized honeypot services

## Monitoring and Logs

- View real-time container status through the web interface
- Access container logs via the "Logs" button in the UI

The system provides a robust foundation for cybersecurity research and education, particularly in the area of honeypot deployment and attack pattern analysis. The modular architecture allows for easy extension with additional honeypot types as needed.


