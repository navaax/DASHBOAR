const downloadReport = () => {
  const table = document.querySelector('table');
  if (!table) {
      console.error("Table not found!");
      return;
  }

  const rows = table.querySelectorAll('tr');
  let csvContent = "";

  // Get table headers
  const headers = table.querySelectorAll('th');
  const headerRow = Array.from(headers).map(header => header.textContent.trim()).join(',') + "\r\n";
  csvContent += headerRow;

  rows.forEach((row, index) => {
      // Skip the header row
      if (index === 0) return;

      const cells = row.querySelectorAll('td');
      const rowData = Array.from(cells).map(cell => {
        // Check if the cell has a span element (for badges)
        const spanElement = cell.querySelector('span');
        if (spanElement) {
            return `"${spanElement.textContent.trim()}"`;
        }

        return `"${cell.textContent.trim().replace(/"/g, '""')}"`; 
      }).join(',');

      csvContent += rowData + "\r\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "report.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const loadJSON = async () => {
  try {
      const response = await fetch('pc.json');
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
  } catch (error) {
      console.error("Error loading or parsing JSON:", error);
      return null;
  }
};

const renderTable = async () => {
  const data = await loadJSON();
  const tbody = document.getElementById('dinamicData'); // Use the correct tbody ID

  if (!tbody) {
      console.error("tbody element with id 'dinamicData' not found!");
      return;
  }

  tbody.innerHTML = ''; // Clear existing content

  if (data && data.areas && Array.isArray(data.areas)) {
      data.areas.forEach(area => {
          if (area.computadoras && Array.isArray(area.computadoras)) {
              area.computadoras.forEach(computer => {
                  const row = document.createElement('tr');

                  // Create table cells and populate them with data, matching your example
                  const checkboxCell = document.createElement('td');
                  checkboxCell.innerHTML = '<input type="checkbox">';
                  row.appendChild(checkboxCell);


                  const idCell = document.createElement('td');
                  idCell.textContent = computer.id || "N/A";
                  row.appendChild(idCell);


                  const nameCell = document.createElement('td');
                  nameCell.textContent = computer.nombre || "N/A";
                  row.appendChild(nameCell);

                  const userNameCell = document.createElement('td');
                  userNameCell.textContent = computer.userInfo ? computer.userInfo[0]?.UserName || "N/A" : "N/A";
                  row.appendChild(userNameCell);
                  
                  const osCell = document.createElement('td');
                  osCell.textContent = computer.osInfo?.Caption || "N/A";
                  row.appendChild(osCell);

                  const cpuCell = document.createElement('td');
                  cpuCell.textContent = computer.cpuInfo?.Name || "N/A";
                  row.appendChild(cpuCell);


                  const progressBarContainer = document.createElement('div');
                progressBarContainer.className = 'progress-bar-container'; // Add a CSS class

                // Create the progress bar element
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';


                const totalRam = computer.ramInfo?.TotalRAM || 0;
                const freeRam = computer.ramInfo?.FreeRAM || 0;
                const ramPercentage = (freeRam / totalRam) * 100; // Calculate the percentage
                progressBar.style.width = `${ramPercentage}%`; // Set progress bar width
                const usedRam = totalRam- freeRam;
                // progressBar.textContent = `${usedRam.toFixed(2)} / ${totalRam} GB`;
                progressBar.style.display = "flex";
                progressBar.style.justifyContent = "center";
                progressBar.style.alignItems = "center";


                // Label for the total RAM
                const totalRamLabel = document.createElement('div');

                // Add tooltip with total and free RAM
                progressBar.title = `${freeRam} / ${totalRam}`;

                // Add the progress bar and its container to the table cell
                progressBarContainer.appendChild(progressBar);

                totalRamLabel.textContent = `RAM: ${totalRam} GB / Espacio Libre${freeRam} GB`;
                totalRamLabel.style.fontSize = "smaller";
                totalRamLabel.style.textAlign="center";
                



                const ramCell = document.createElement('td');
                
                ramCell.appendChild(progressBarContainer);
                row.appendChild(ramCell);
                ramCell.appendChild(totalRamLabel);

                // Disk space progress bar
                const diskProgressBarContainer = document.createElement('div');
                diskProgressBarContainer.className = 'progress-bar-container';

                const diskProgressBar = document.createElement('div');
                diskProgressBar.className = 'progress-bar';


                const totalDisk = computer.diskInfo?.Size || 0;
                const freeDisk = computer.diskInfo?.FreeSpace || 0;
                const diskPercentage = (freeDisk / totalDisk) * 100;
                const usedDisk = totalDisk- freeDisk;
                diskProgressBar.style.display = "flex";
                diskProgressBar.style.justifyContent = "center";
                diskProgressBar.style.alignItems = "center";
                diskProgressBar.textContent = `${usedDisk.toFixed(2)} / ${totalDisk} GB`;
                // Label for the total Disk

                const totalDiskLabel = document.createElement('div');

                diskProgressBar.style.width = `${diskPercentage}%`;
                // diskProgressBar.title = `${freeDisk} / ${totalDisk}`; // Add tooltip

                diskProgressBarContainer.appendChild(diskProgressBar);
                const diskCell = document.createElement('td');
                diskCell.appendChild(diskProgressBarContainer);
                row.appendChild(diskCell);
                
                totalDiskLabel.textContent = `Total Disco: ${totalDisk} GB / Espacio Libre${freeDisk} GB`;
                totalDiskLabel.style.fontSize = "smaller";
                totalDiskLabel.style.textAlign="center";
                diskCell.appendChild(totalDiskLabel);



                  const networkCell = document.createElement('td');
                  networkCell.textContent = computer.networkAdapters?.[0]?.IPv4Address || computer.networkAdapters?.[0]?.direcIP || "N/A";
                  row.appendChild(networkCell);

                  const appCell = document.createElement('td');
                  let appList = "";
                  if (computer.installedPrograms && Array.isArray(computer.installedPrograms)) {
                      computer.installedPrograms.forEach(program => {
                          appList += (program.DisplayName || program.Name || "N/A") + "<br>";
                      });
                  } else if (computer.installedPrograms) {
                      appList = computer.installedPrograms.DisplayName || computer.installedPrograms.Name || "N/A";
                  } else {
                      appList = "N/A";
                  }
                  appCell.innerHTML = appList;
                  row.appendChild(appCell);


                  tbody.appendChild(row);
              });
          }
      });
  } else {
      console.error("Error: Invalid data format in pc.json or data not found.");
      tbody.innerHTML = '<tr><td colspan="10">Error loading or parsing data from pc.json.</td></tr>';
  }
};

renderTable();

// Create the download button and append it to the page
document.addEventListener('DOMContentLoaded', () => {
  const downloadButton = document.createElement('button');
  downloadButton.textContent = 'Download Report';
  downloadButton.id = 'downloadReportButton'; // Add an id to the button
  downloadButton.style.position = 'fixed';
  downloadButton.style.bottom = '20px';
  downloadButton.style.left = '50%';
  downloadButton.style.transform = 'translateX(-50%)';
  downloadButton.style.padding = '10px';
  downloadButton.addEventListener('click', downloadReport);
  document.body.appendChild(downloadButton);
});
