document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos DOM
  const btnDesplegar = document.getElementById("btnDesplegar")
  const btnConfirmDesplegar = document.getElementById("btnConfirmDesplegar")
  const btnConfirmAction = document.getElementById("btnConfirmAction")
  const btnRefreshLogs = document.getElementById("btnRefreshLogs")
  const containersTableBody = document.getElementById("containersTableBody")
  const imageSelector = document.getElementById("imageSelector")

  // Referencias a modales
  const modalDesplegarElement = document.getElementById("modalDesplegar")
  const modalInfoElement = document.getElementById("modalInfo")
  const modalConfirmElement = document.getElementById("modalConfirm")
  const modalLogsElement = document.getElementById("modalLogs")

  const modalDesplegar = new bootstrap.Modal(modalDesplegarElement)
  const modalInfo = new bootstrap.Modal(modalInfoElement)
  const modalConfirm = new bootstrap.Modal(modalConfirmElement)
  const modalLogs = new bootstrap.Modal(modalLogsElement)

  // Variables para almacenar contexto de acción
  let currentAction = null
  let currentContainerId = null
  let currentContainerName = null
  let contenedores = []              // declaraciones   
  let html_str  = ''              // de variables
  let i         = 0               //	
	
  // Cargar contenedores al iniciar
//  loadContainers()

  // Cargar honeypots disponibles
    loadAvailableHoneypots()

fetch('/api/containers')           // GET por defecto,
.then(res => res.json())        // respuesta en json, otra promise
.then(filas => {                // arrow function

    filas.forEach(fila => {     // bucle ES6, arrow function
        i++
        contenedores.push(fila)      // se guardan para después sacar cada una             
        // ES6 templates

        html_str += `<tr data-id="${fila.ID}">
            <td>
              <span class="badge bg-success">${fila.Status}</span>
            </td>
            <td>
              <a href="#" class="image-name text-info text-decoration-none" data-id="${fila.ID}">
                ${fila.Image}
              </a>
            </td>
            <td class="text-end">
              <button class="btn btn-warning btn-sm me-2 btn-log" data-id="${fila.ID}" data-name="${fila.Image}">
                <i class="bi bi-journal-text me-1"></i>Log
              </button>
              <button class="btn btn-danger btn-sm btn-delete" data-id="${fila.ID}" data-name="${fila.Image}">
                <i class="bi bi-trash me-1"></i>Delete
              </button>
            </td>
          </tr>`
                         // ES6 templates
	// Agregar eventos a los nuevos elementos
      	addEventListeners()
    });
	
    containersTableBody.innerHTML = html_str
    addEventListeners()
    //document.getElementById('tbody').innerHTML=html_str  // se pone el html en su sitio
})

  // Función para cargar contenedores
  async function loadContainers() {
    try {
      const response = await fetch("/api/containers")
      const containers = await response.json()

      if (containers.length === 0) {
        containersTableBody.innerHTML = `
          <tr>
            <td colspan="3" class="text-center">No hay contenedores en ejecución</td>
          </tr>
        `
        return
      }

      let tableContent = ""

      containers.forEach((container) => {
        const statusClass = getStatusClass(container.status)

        tableContent += `
          <tr data-id="${container.id}">
            <td>
              <span class="badge ${getStatusClass(container.status)}">${container.status}</span>
            </td>
            <td>
              <a href="#" class="image-name text-info text-decoration-none" data-id="${container.id}">
                ${container.name}
              </a>
            </td>
            <td class="text-end">
              <button class="btn btn-warning btn-sm me-2 btn-log" data-id="${container.id}" data-name="${container.name}">
                <i class="bi bi-journal-text me-1"></i>Log
              </button>
              <button class="btn btn-danger btn-sm btn-delete" data-id="${container.id}" data-name="${container.name}">
                <i class="bi bi-trash me-1"></i>Delete
              </button>
            </td>
          </tr>
        `
      })

      containersTableBody.innerHTML = tableContent

      // Agregar eventos a los nuevos elementos
      addEventListeners()
    } catch (error) {
      console.error("Error al cargar contenedores:", error)
      containersTableBody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-danger">Error al cargar contenedores: ${error.message}</td>
        </tr>
      `
    }
  }

  // Función para cargar honeypots disponibles
  async function loadAvailableHoneypots() {
    try {
      const response = await fetch("/api/honeypots")
      const honeypots = await response.json()

      let options = ""

      honeypots.forEach((honeypot) => {
        options += `<option value="${honeypot.id}">${honeypot.name} - ${honeypot.description}</option>`
      })

      imageSelector.innerHTML = options
    } catch (error) {
      console.error("Error al cargar honeypots disponibles:", error)
      imageSelector.innerHTML = `<option disabled>Error al cargar honeypots</option>`
    }
  }

  // Función para agregar event listeners a elementos dinámicos
  function addEventListeners() {
    // Eventos para nombres de imágenes
    document.querySelectorAll(".image-name").forEach((name) => {
      name.addEventListener("click", showContainerInfo)
    })

    // Eventos para botones de log
    document.querySelectorAll(".btn-log").forEach((btn) => {
      btn.addEventListener("click", showLogConfirmation)
    })

    // Eventos para botones de delete
    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", showDeleteConfirmation)
    })
  }

  // Función para obtener la clase CSS según el estado del contenedor
  function getStatusClass(status) {
    switch (status) {
      case "running":
        return "bg-success"
      case "restarting":
        return "bg-warning text-dark"
      case "exited":
        return "bg-danger"
      case "created":
        return "bg-secondary"
      default:
        return "bg-secondary"
    }
  }

  // Función para mostrar información del contenedor
  async function showContainerInfo(e) {
    e.preventDefault()

    const containerId = this.dataset.id

    try {
      const response = await fetch(`/api/container/${containerId}`)
      const container = await response.json()

      if (response.status !== 200) {
        throw new Error(container.error || "Error al obtener información del contenedor")
      }

      // Formatear fecha de creación
      const createdDate = new Date(container.created)
      const formattedDate = createdDate.toLocaleString()

      // Actualizar información en el modal
      document.getElementById("infoName").textContent = container.name
      document.getElementById("infoStatus").textContent = container.status
      document.getElementById("infoCreated").textContent = formattedDate
      document.getElementById("infoImage").textContent = container.image

      // Mostrar configuración
      const config = {
        env: container.config.env,
        cmd: container.config.cmd,
        volumes: container.config.volumes,
      }
      document.getElementById("infoConfig").textContent = JSON.stringify(config, null, 2)

      // Mostrar puertos
      const portsContainer = document.getElementById("infoPorts")
      portsContainer.innerHTML = ""

      if (container.ports && Object.keys(container.ports).length > 0) {
        for (const [containerPort, hostBindings] of Object.entries(container.ports)) {
          if (hostBindings) {
            const hostPort = hostBindings[0]?.HostPort || "N/A"
            const portBadge = document.createElement("span")
            portBadge.className = "port-badge"
            portBadge.textContent = `${containerPort} → ${hostPort}`
            portsContainer.appendChild(portBadge)
          } else {
            const portBadge = document.createElement("span")
            portBadge.className = "port-badge"
            portBadge.textContent = `${containerPort} (no mapeado)`
            portsContainer.appendChild(portBadge)
          }
        }
      } else {
        portsContainer.innerHTML = "<p class='text-muted'>No hay puertos expuestos</p>"
      }

      // Mostrar modal
      modalInfo.show()
    } catch (error) {
      console.error("Error:", error)
      alert(`Error al obtener información del contenedor: ${error.message}`)
    }
  }

  // Función para mostrar confirmación de logs
  function showLogConfirmation() {
    currentAction = "log"
    currentContainerId = this.dataset.id
    currentContainerName = this.dataset.name

    document.getElementById("modalConfirmBody").textContent = `¿Deseas ver los logs de "${currentContainerName}"?`
    document.getElementById("modalConfirmLabel").textContent = "Confirmar visualización de logs"

    const confirmBtn = document.getElementById("btnConfirmAction")
    confirmBtn.className = "btn btn-warning"
    confirmBtn.textContent = "Ver logs"

    modalConfirm.show()
  }

  // Función para mostrar confirmación de eliminación
  function showDeleteConfirmation() {
    currentAction = "delete"
    currentContainerId = this.dataset.id
    currentContainerName = this.dataset.name

    document.getElementById("modalConfirmBody").textContent =
      `¿Estás seguro de que deseas eliminar "${currentContainerName}"?`
    document.getElementById("modalConfirmLabel").textContent = "Confirmar eliminación"

    const confirmBtn = document.getElementById("btnConfirmAction")
    confirmBtn.className = "btn btn-danger"
    confirmBtn.textContent = "Eliminar"

    modalConfirm.show()
  }

  // Función para mostrar logs
  async function showLogs(containerId, containerName) {
    try {
      const response = await fetch(`/api/logs/${containerId}`)
      const data = await response.json()

      if (response.status !== 200) {
        throw new Error(data.error || "Error al obtener logs")
      }

      document.getElementById("logsTitle").textContent = `Logs de ${containerName}`
      document.getElementById("logsContent").textContent = data.logs.join("\n")

      // Guardar el ID del contenedor para actualizar logs
      document.getElementById("btnRefreshLogs").dataset.id = containerId
      document.getElementById("btnRefreshLogs").dataset.name = containerName

      modalLogs.show()
    } catch (error) {
      console.error("Error:", error)
      alert(`Error al obtener logs: ${error.message}`)
    }
  }
	


function crear(){
        //document.getElementById("garnish").value
        let newname = document.getElementById("imageSelector").value
        console.log(newname)

        return fetch('/api/deploy/' + newname,  {
                method: 'GET'
        })
        .then(data => {
                // If you need to reload the page after processing the response:
                window.location.reload();
        })
        .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
        });
}

function borrar(i){

    return fetch('api/deploy/' + contenedores.at(i-1).ID,  {
        method: 'DELETE'
    })
    .then(window.location.reload()) // or res.json()
    .then(res => console.log(res))

}


  // Función para eliminar contenedor
  async function deleteContainer(containerId) {
    try {
      const response = await fetch(`/api/delete/${containerId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.status !== 200) {
        throw new Error(data.error || "Error al eliminar contenedor")
      }

      // Eliminar fila de la tabla
      const row = document.querySelector(`tr[data-id="${containerId}"]`)
      if (row) {
        row.classList.add("table-danger")
        setTimeout(() => {
          row.remove()

          // Si no quedan filas, mostrar mensaje
          if (containersTableBody.querySelectorAll("tr").length === 0) {
            containersTableBody.innerHTML = `
              <tr>
                <td colspan="3" class="text-center">No hay contenedores en ejecución</td>
              </tr>
            `
          }
        }, 500)
      }

      alert(data.message)
    } catch (error) {
      console.error("Error:", error)
      alert(`Error al eliminar contenedor: ${error.message}`)
    }
  }

  // Evento para abrir modal de despliegue
  btnDesplegar.addEventListener("click", () => {
    modalDesplegar.show()
  })

  // Evento para confirmar despliegue de imágenes
  btnConfirmDesplegar.addEventListener("click", async () => {
    const selectedHoneypots = Array.from(imageSelector.selectedOptions).map((option) => option.value)

    if (selectedHoneypots.length === 0) {
      alert("Por favor, selecciona al menos un honeypot")
      return
    }
     
     crear()	  
     modalDesplegar.hide()
	
  })

  // Evento para confirmar acción
  btnConfirmAction.addEventListener("click", () => {
    modalConfirm.hide()

    if (currentAction === "log") {
      showLogs(currentContainerId, currentContainerName)
    } else if (currentAction === "delete") {
      deleteContainer(currentContainerId)
    }
  })

  // Evento para actualizar logs
  btnRefreshLogs.addEventListener("click", function () {
    const containerId = this.dataset.id
    const containerName = this.dataset.name

    if (containerId) {
      showLogs(containerId, containerName)
    }
  })
})
