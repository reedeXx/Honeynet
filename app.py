from flask import Flask, Response, render_template, request, jsonify
from flask_cors import CORS
import docker
from docker.errors import NotFound
from bson.json_util import dumps
import subprocess
import os
import json
from datetime import datetime

app = Flask(__name__)
# Conexión al demonio de Docker
client = docker.from_env()
CORS(app)

# Definición de honeypots disponibles
AVAILABLE_HONEYPOTS = [
    {
        "id": "cowrie",
        "name": "cowrie/cowrie",
        "description": "Honeypot SSH y Telnet de media interacción.",
        "ports": {"2222/tcp": 2222, "2223/tcp": 2223},
        "tags": ["ssh", "telnet", "medium-interaction"]
    },
    {
        "id": "ddospot",
        "name": "my-ddospot",
        "description": "Detectar y analizar ataques DDoS.",
        "ports": {"19/udp": 19, "53/udp": 5003, "123/udp": 123, "1900/udp": 1900},
        "tags": ["ddos", "udp", "reflection"]
    },
    {
        "id": "dicompot",
        "name": "dicompot:latest",
        "description": "Simula dispositivos médicos DICOM.",
        "ports": {"11112/tcp": 11112},
        "tags": ["dicom", "medical", "healthcare"]
    },
    {
        "id": "wordpot",
        "name": "wordpot",
        "description": "Simula un servidor WordPress vulnerable.",
        "ports": {"80/tcp": 80},
        "tags": ["web", "wordpress", "cms"]
    },
    {
        "id": "honeypots",
        "name": "my-honeypots",
        "description": "Honeypot multi-servicio para bases de datos SQL/NoSQL.",
        "ports": {
            "1433/tcp": 1433,    # MSSQL
            "3306/tcp": 3306,    # MySQL
            "5432/tcp": 5432,    # PostgreSQL
            "6379/tcp": 6379,    # Redis
            "27017/tcp": 27017,  # MongoDB
            "1521/tcp": 1521      # Oracle
        },
        "tags": ["sql", "database", "multi-service", "mssql", "mysql", "postgresql", "redis", "mongodb", "oracle"]
    }


    ]

@app.route('/')
def index():   
    # Convertimos los resultados a formato JSON
    # Obtener la lista de contenedores en ejecución
    containers = client.containers.list()

    # Estructurar los datos en un diccionario
    container_data = []

    for container in containers:
        container_info = {
            "ID": container.id,
            "Image": container.image.tags[0] if container.image.tags else "No Tag",
            "Status": container.status,
            "Ports": container.attrs['NetworkSettings']['Ports']
        }
        container_data.append(container_info)

    resJson = dumps(container_data)
    # app.logger.debug(resJson)

    return render_template('index.html')

@app.route('/api/honeypots')
def get_available_honeypots():
    return jsonify(AVAILABLE_HONEYPOTS)

@app.route('/api/containers', methods=['GET'])
def get_containers():
        if request.method == 'GET':
            # Obtener la lista de contenedores en ejecución
            containers = client.containers.list()

            # Estructurar los datos en un diccionario
            container_data = []

            for container in containers:
                container_info = {
                    "ID": container.id,
                    "Image": container.image.tags[0] if container.image.tags else "No Tag",
                    "Status": container.status,
                    "Ports": container.attrs['NetworkSettings']['Ports']
                }
                container_data.append(container_info)

            resJson = dumps(container_data)
            app.logger.debug(resJson)
            return Response(resJson, mimetype='application/json')

@app.route('/api/deploy/<id>', methods=['GET', 'POST' , 'PUT', 'DELETE'])
def api_deploy(id):
    if request.method == 'GET':
        if id == 'cowrie':
            # Verificar si el contenedor ya existe y eliminarlo
            # Nombre del contenedor
            # container_name = "cowrie_honeypot"

            # Verificar si el contenedor ya existe        
            # existing_container = client.containers.get(container_name)
            # print(f"El contenedor '{container_name}' ya existe. Eliminándolo...")
            # existing_container.remove(force=True)  # Eliminar el contenedor existente
            # print(f"Contenedor '{container_name}' eliminado exitosamente.")
            
            client.images.pull("cowrie/cowrie")


            container = client.containers.run(
            image="cowrie/cowrie",  # Usar la imagen de Cowrie
            ports={'2222/tcp': 2222,'2223/tcp': 2223},  # Mapear el puerto 2222,
            environment={ 'COWRIE_TELNET_ENABLED' : 'yes' },
            name="cowrie_honeypot"  
            )
        
        if id == 'ddospot': 
            print(f"Construyendo la imagen Ddospot...")
            command = ["docker", "build", "-t", "my-ddospot", "./docker/ddospot"]
            try:
                # Ejecutar el comando
                result = subprocess.run(command, check=True, text=True, capture_output=True)

             
                print("Salida del comando:")
                print(result.stdout)
            except subprocess.CalledProcessError as e:
                
                print("Error al ejecutar el comando:")
                print(e.stderr)
            print(f"Ejecutando la imagen Ddospot...")    
            container = client.containers.run(
            "my-ddospot",
            name="ddospot-container",  # Nombre del contenedor
            ports={
            '19/udp': 19,
            '53/udp': 5003,
            '123/udp': 123,
            '1900/udp': 1900,
            },
            detach=False  # No correr en modo detach para que sea interactivo
            )
            container.start()
        if id == 'dicompot':
            command = ["docker", "build", "-t", "my-dicompot", "./docker/dicompot/dicompot"]
            try:
                # Ejecutar el comando
                result = subprocess.run(command, check=True, text=True, capture_output=True)

                # Imprimir la salida del comando
                print("Salida del comando:")
                print(result.stdout)
            except subprocess.CalledProcessError as e:
                # En caso de error, imprimir la salida de error
                print("Error al ejecutar el comando:")
                print(e.stderr)
            

            container = client.containers.run(
            "my-dicompot",   
            name="my-dicompot",
            ports={'11112/tcp': 11112},  # Mapear el puerto 11112
            detach=False,  # No correr en modo detach para que sea interactivo
            remove=True,   # Eliminar el contenedor al detenerlo
            read_only=True,            # Establecer el contenedor como de solo lectura
            )
            container.start()

        if id == 'wordpot':

            print(f"Construyendo la imagen Wordpot...")
            command = ["docker", "build", "-t", "my-wordpot", "./docker/wordpot"]
            try:
                # Ejecutar el comando
                result = subprocess.run(command, check=True, text=True, capture_output=True)

                # Imprimir la salida del comando
                print("Salida del comando:")
                print(result.stdout)
            except subprocess.CalledProcessError as e:
                # En caso de error, imprimir la salida de error
                print("Error al ejecutar el comando:")
                print(e.stderr)

            print(f"Ejecutando el contenedor con la imagen...")
            container = client.containers.run(
                "my-wordpot",
                detach=True,  # Ejecutar en segundo plano
                ports={'80/tcp': 80},  # Mapear el puerto 80 del contenedor al puerto 80 del >
                name="wordpot_container"  # Nombre del contenedor
            )   
            container.start()
        if id == 'honeypots': 
            # Configuración de los puertos
            current_dir = os.path.dirname(os.path.abspath(__file__))  # Directorio del script
            config_path = os.path.join(current_dir, "docker", "honeypots", "config.json")

            port_bindings = {
                '1433/tcp': ('0.0.0.0', 1433),  # Microsoft SQL Server
                '3306/tcp': ('0.0.0.0', 3306),  # MySQL
                '5432/tcp': ('0.0.0.0', 5432),  # PostgreSQL
                '6379/tcp': ('0.0.0.0', 6379),   # Redis
                '27017/tcp': ('0.0.0.0', 27017), # MongoDB
                '1521/tcp': ('0.0.0.0', 1521)    # Oracle
            }
            
            volumes = {
                config_path : {
                'bind': '/opt/honeypots/config.json',
                'mode': 'ro'  # Solo lectura (opcional)
                 }
            }

            # Crear y ejecutar el contenedor
            container = client.containers.run(
                'dtagdevsec/honeypots:24.04',
                name='honeypots_sql',
                volumes=volumes,
                ports=port_bindings,
                detach=True
            )

        
    return jsonify({"   ": "Exito"}) ,  200


@app.route('/api/container/<container_id>', methods=['GET'])
def get_container_info(container_id):
    try:
        container = client.containers.get(container_id)
        
        # Obtener información detallada del contenedor
        container_info = {
            "id": container.id,
            "name": container.name,
            "image": container.image.tags[0] if container.image.tags else "No Tag",
            "status": container.status,
            "created": container.attrs['Created'],
            "ports": container.attrs['NetworkSettings']['Ports'],
            "config": {
                "env": container.attrs['Config']['Env'],
                "cmd": container.attrs['Config']['Cmd'],
                "volumes": container.attrs['Config']['Volumes']
            }
        }
        
        return jsonify(container_info)
    except NotFound:
        return jsonify({"error": "Contenedor no encontrado"}), 404
    except Exception as e:
        app.logger.error(f"Error al obtener información del contenedor: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/logs/<container_id>', methods=['GET'])
def get_container_logs(container_id):
    try:
        container = client.containers.get(container_id)
        logs = container.logs(tail="10000").decode('utf-8')
        
        # Formatear los logs para mostrarlos línea por línea
        log_lines = logs.split('\n')
        
        return jsonify({
            "container_id": container_id,
            "container_name": container.name,
            "logs": log_lines
        })
    except NotFound:
        return jsonify({"error": "Contenedor no encontrado"}), 404
    except Exception as e:
        app.logger.error(f"Error al obtener logs del contenedor: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/delete/<container_id>', methods=['DELETE'])
def delete_container(container_id):
    
    container = client.containers.get(container_id)
    container_name = container.name
    
    # Eliminar el contenedor
    container.remove(force=True)


    image = container.image
    image_id = image.id.replace('sha256:', '')
    client.images.remove(image_id, force=True)
    # Eliminar el contenedor
    #  container.remove(force=True)
    return jsonify({
        "message": "Contenedor eliminado correctamente"
    }), 200
    
           

if __name__ == '__main__':
    app.run(debug=True, host='192.168.56.102', port=5001)
