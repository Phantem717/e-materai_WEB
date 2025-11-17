const axios = require('axios');
require('dotenv').config();

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const STAMP_URL= process.env.STAMP_URL;
const return_url = process.env.DISPLAY_URL;
const UNSIGNED_DIR = path.join(process.env.PATH_UNSIGNED);
const STAMP_DIR = path.join(process.env.PATH_STAMP)
const SIGNED_DIR = path.join(process.env.PATH_SIGNED)
async function getTypes(header) {
    try {      

        const response = await axios({
            method: 'get',
            url: `${STAMP_URL}/jenisdoc`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': header
            }
        });
        // console.log("RESPONSE BATCH",response);
        return response.data;
    } catch (error) {
        console.error("GET TYPE Error Details:", {
            status: error.response?.status,
            headersSent: error.config?.headers,
            serverResponse: error.response?.data,
            message: error.message
        });
        throw new Error(`GET TYPE failed: ${error.response?.data?.message || error.message}`);
    }
}


async function retrieveJSON(batchId){
    try {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await delay(2000)
        const response = await axios ({
            method: 'get',
            url: return_url
        });
        // console.log("RESPONSE",response.data);
        const data = response.data;
        // console.log("BID",batchId); // "object"
        // console.log("All batchIds:", response.data.map(i => i.result.batchId));
// console.log("Looking for:", batchId);
        const found = data.filter(item => {
            // console.log(item.result.batchId)
            return item.result.batchId == batchId});
        // console.log("FOUND",found);
        return found;
    } catch (error) {
        console.error("JSON RETRIEVAL Error Details:", {
            status: error.response?.status,
            headersSent: error.config?.headers,
            serverResponse: error.response?.data,
            message: error.message
        });
        throw new Error(`JSON RETRIVEAL failed: ${error.response?.data?.message || error.message}`);
    }
}
const getDocumentsByBatch = async (title,type) => {
   try {
        if (!fs.existsSync(UNSIGNED_DIR)) {
            return [];
        }

        const allFiles = fs.readdirSync(UNSIGNED_DIR);
        console.log("FILES",allFiles);
        const matchingFiles = allFiles.filter(file => {
            return file.endsWith('.pdf') && file.startsWith(title);
        });

        console.log(`Files starting with "${title}":`, matchingFiles.length);

        return matchingFiles.map(filename => {
            const filePath = path.join(UNSIGNED_DIR, filename);
            const stats = fs.statSync(filePath);

            return {
                filename: filename,
                url: `${process.env.BASE_URL}/api/retrieve/files/${filename}`,
                size: stats.size,
                modified: stats.mtime,
                type: type
            };
        });

    } catch (error) {
        console.error(`Error in getFilesByPrefix:`, error);
        return [];
    }
};

const getDocumentByName = async (title) => {
     try {
    if (!fs.existsSync(UNSIGNED_DIR)) {
      console.warn("UNSIGNED_DIR does not exist:", UNSIGNED_DIR);
      return null;
    }

    const allfiles = fs.readdirSync(UNSIGNED_DIR);
    console.log("🔍 Total files in UNSINGED_DIR:", allfiles.length);

    const cleanTitle = title.trim().toLowerCase();

    // Replace dashes with underscores for comparison flexibility
    const normalizedTitle = cleanTitle.replace(/[-]/g, "_");

    // Find the closest matching file
    const matchingFiles = allfiles.filter((file) => {
      const normalizedFile = file.toLowerCase().replace(/[-]/g, "_");
      return normalizedFile.includes(normalizedTitle) && file.endsWith(".pdf");
    });

    if (matchingFiles.length === 0) {
      console.warn(`⚠️ No matching .png found for prefix "${title}"`);
      return null;
    }

    // If multiple, return the most recently modified one
    const chosen =
      matchingFiles.length > 1
        ? matchingFiles.sort((a, b) => {
            const aTime = fs.statSync(path.join(UNSIGNED_DIR, a)).mtime;
            const bTime = fs.statSync(path.join(UNSIGNED_DIR, b)).mtime;
            return bTime - aTime;
          })[0]
        : matchingFiles[0];

    console.log("✅ Found match:", chosen);
    return path.join(UNSIGNED_DIR, chosen);

  } catch (error) {
    console.error("❌ Error in getStamp:", error);
    return null;
  }
}

const getStampedBatch = async (title) => {
    try {
        if (!fs.existsSync(SIGNED_DIR)) {
            return [];
        }

        const allFiles = fs.readdirSync(SIGNED_DIR);
        console.log("FILES",allFiles);
        const matchingFiles = allFiles.filter(file => {
            return file.endsWith('.pdf') && file.startsWith(title);
        });

        console.log(`Files starting with "${title}":`, matchingFiles.length);

        return matchingFiles.map(filename => {
            const filePath = path.join(SIGNED_DIR, filename);
            const stats = fs.statSync(filePath);

            return {
                filename: filename,
                url: `${process.env.BASE_URL}/api/retrieve/files/${filename}`,
                size: stats.size,
                modified: stats.mtime,
                type: type
            };
        });

    } catch (error) {
        console.error(`Error in getFilesByPrefix:`, error);
        return [];
    }
}
const getStamp = async (title) => {
  try {
        if (!fs.existsSync(SIGNED_DIR)) {
            return [];
        }

        const allFiles = fs.readdirSync(SIGNED_DIR);
        console.log("FILES",allFiles);
        const matchingFiles = allFiles.filter(file => {
            return file.endsWith('.pdf') && file.startsWith(title);
        });

        console.log(`Files starting with "${title}":`, matchingFiles.length);

        return matchingFiles.map(filename => {
            const filePath = path.join(SIGNED_DIR, filename);
            const stats = fs.statSync(filePath);

            return {
                filename: filename,
                url: `${process.env.BASE_URL}/api/retrieve/files-stamped/${filename}`,
                size: stats.size,
                modified: stats.mtime,
                type: type
            };
        });

    } catch (error) {
        console.error(`Error in getFilesByPrefix:`, error);
        return [];
    }
};


module.exports = { getTypes,retrieveJSON,getDocumentsByBatch,getStamp,getDocumentByName,getStampedBatch};
