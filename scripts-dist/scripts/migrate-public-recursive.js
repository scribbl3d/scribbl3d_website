"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var fs_1 = require("fs");
var path_1 = require("path");
var cloudinary_1 = require("../lib/cloudinary");
var prisma = new client_1.PrismaClient();
var PUBLIC_DIR = path_1.default.join(process.cwd(), "public");
var ROOT_FOLDERS = [
    "blog-images",
    "filaments",
    "hero-images",
    "images",
    "landingpage",
    "printer-images",
    "printer_images",
    "product-images",
    "services",
];
function walk(dir, cb) {
    var items = fs_1.default.readdirSync(dir);
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        var full = path_1.default.join(dir, item);
        var stat = fs_1.default.statSync(full);
        if (stat.isDirectory()) {
            walk(full, cb);
        }
        else {
            cb(full);
        }
    }
}
function migrateFile(fullPath) {
    return __awaiter(this, void 0, void 0, function () {
        var relative, folder, uploaded, newUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    relative = fullPath.replace(PUBLIC_DIR, "").replace(/\\/g, "/");
                    folder = path_1.default.dirname(relative).slice(1);
                    console.log("⬆️ Uploading", relative);
                    return [4 /*yield*/, cloudinary_1.default.uploader.upload(fullPath, {
                            folder: folder,
                            resource_type: "auto",
                        })];
                case 1:
                    uploaded = _a.sent();
                    newUrl = uploaded.secure_url;
                    // ---------- DB UPDATES ----------
                    // Blog
                    return [4 /*yield*/, prisma.blog.updateMany({
                            where: {
                                OR: [{ thumbnailImage: relative }, { heroImage: relative }],
                            },
                            data: {
                                thumbnailImage: newUrl,
                                heroImage: newUrl,
                            },
                        })];
                case 2:
                    // ---------- DB UPDATES ----------
                    // Blog
                    _a.sent();
                    // HeroImage
                    return [4 /*yield*/, prisma.heroImage.updateMany({
                            where: { imageUrl: relative },
                            data: { imageUrl: newUrl },
                        })];
                case 3:
                    // HeroImage
                    _a.sent();
                    // Carousel
                    return [4 /*yield*/, prisma.carouselItem.updateMany({
                            where: { src: relative },
                            data: { src: newUrl },
                        })];
                case 4:
                    // Carousel
                    _a.sent();
                    // PrinterImage
                    return [4 /*yield*/, prisma.printerImage.updateMany({
                            where: { url: relative },
                            data: { url: newUrl },
                        })];
                case 5:
                    // PrinterImage
                    _a.sent();
                    console.log("✅ Migrated", relative);
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, ROOT_FOLDERS_1, root, rootPath;
        return __generator(this, function (_a) {
            console.log("🚀 Starting recursive migration");
            for (_i = 0, ROOT_FOLDERS_1 = ROOT_FOLDERS; _i < ROOT_FOLDERS_1.length; _i++) {
                root = ROOT_FOLDERS_1[_i];
                rootPath = path_1.default.join(PUBLIC_DIR, root);
                if (!fs_1.default.existsSync(rootPath))
                    continue;
                walk(rootPath, migrateFile);
            }
            console.log("🎉 Migration finished");
            process.exit();
            return [2 /*return*/];
        });
    });
}
main();
