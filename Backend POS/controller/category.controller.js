const Category = require('../data_access/model/category.model')
const RepositoryBase = require('../data_access/repository.base')
const CommandResult = require('../Utilities/command.result')
const CategoryRepo = new RepositoryBase(Category)
const { Op } = require('sequelize')
const fs = require('fs')
const path = require('path')

const ExcelJs = require('exceljs')
const { Document, Packer, TextRun, Paragraph, Table, TableRow, TableCell, HeadingLevel, HeightRule, AlignmentType, Header, WidthType, VerticalAlign } = require("docx");

exports.ExcelReport = async (req, res) => {
    const { name, page = 1, length = -1, sortBy = 'id', sortOrder = 'desc' } = req.query
    var filter = { deleted: false }
    
    if (name) {
        filter.name = { [Op.like]: `%${name}%` }        
    }

    var result = await CategoryRepo.GetAll({ 
        filter: filter, 
        page: page, 
        length: length, 
        sortBy: sortBy, 
        sortOrder: sortOrder
    })

    if (result.total > 0) {
        const workbook = new ExcelJs.Workbook()
        const sheet = workbook.addWorksheet('CategoryList')
        sheet.columns = [
            { header: 'No', key: 'id', width: 20 },
            { header: 'Name', key: 'name', width: 20 },
        ]

        result.data.forEach((element) => {
            sheet.addRow({
                id: element.id,
                name: element.name
            })
        })

        sheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.font = { name: 'Pyidaungsu', size: 12 }
            })
        })

        const headerRow = sheet.getRow(1)
        headerRow.font = { name: 'Pyidaungsu', bold: true, size: 13 }
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

        var buffer = await workbook.xlsx.writeBuffer()
        res.setHeader('Content-Type', 'application/vmd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', 'attachment; filename=categories.xlsx')
        res.setHeader('Content-Length', buffer.length)
        res.send(buffer)
    } else {
        res.send(null)
    } 
}

exports.ExportDocx = async (req, res) => {
    const { name, page = 1, length = 10, sortBy = 'id', sortOrder = 'desc' } = req.query

    const filter = { deleted: false };
    if (name) {
        filter.name = { [Op.like]: `%${name}%` };
    }

    const result = await CategoryRepo.GetAll({ filter, page, length, sortBy, sortOrder });

    if (result.total > 0) {
        const createParagraph = (text, alignment = AlignmentType.LEFT) =>
            new Paragraph({
                alignment,
                children: [
                    new TextRun({
                        text,
                        font: "Pyidaungsu",
                        size: 26, 
                    }),
                ],
            });

        const tableRows = [
            new TableRow({
                height: { value: 500, rule: HeightRule.EXACT },
                children: [
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: { size: 500, type: WidthType.DXA }, 
                        children: [createParagraph("No", AlignmentType.CENTER)],
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: { size: 100, type: WidthType.DXA },
                        children: [createParagraph("Name", AlignmentType.CENTER)],
                    }),
                ],
            }),
            ...result.data.map((item, index) =>
                new TableRow({
                    height: { value: 500, rule: HeightRule.EXACT },
                    children: [
                        new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            width: { size: 500, type: WidthType.DXA },
                            children: [createParagraph(String(index + 1), AlignmentType.LEFT)],
                        }),
                        new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            width: { size: 1000, type: WidthType.DXA }, 
                            children: [createParagraph(item.name, AlignmentType.LEFT)],
                        }),
                    ],
                })
            ),
        ];

        const doc = new Document({
            sections: [
                {
                    headers: {
                        default: new Header({
                            children: [
                                new Paragraph({
                                    text: "POS Category List",
                                    heading: HeadingLevel.HEADING_1,
                                    alignment: AlignmentType.CENTER,
                                                                    }),
                            ],
                        }),
                    },
                    children: [
                        new Paragraph({
                            text: "Category List",
                            heading: HeadingLevel.HEADING_6,
                        }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: tableRows,
                        }),
                    ],
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", "attachment; filename=categories.docx");
        res.setHeader("Content-Length", buffer.length);
        res.send(buffer);
    } else {
        res.send(null);
    }
}

exports.GetAll = async (req, res) => {
    var { name, page, length, sortBy, sortOrder } = req.query
    var filter = { deleted: false }

    if (name) {
        filter.name = { [Op.like]: `%${name}%` }        
    }

    var result = await CategoryRepo.GetAll({ 
        filter: filter, 
        page: page, 
        length: length, 
        sortBy: sortBy, 
        sortOrder: sortOrder 
    });
    res.json(result)
}

exports.GetById = async (req, res) => {
    var id = req.query.id
    var result = await CategoryRepo.GetById(id)
    res.json(result)
}

// Delete အပိုင်း (Scope Error နှင့် Null Safe ဖြစ်အောင် ပြင်ဆင်ထားပါသည်)
exports.Delete = async (req, res) => {
    var id = req.query.id ? req.query.id : 0    
    var result = new CommandResult()
    if (id > 0) {
        var category = await CategoryRepo.GetById(id)        
        if (category) {
            let imagePath = null;
            // ပုံရှိမှသာ လမ်းကြောင်း တည်ဆောက်မည်
            if (category.image) {
                imagePath = path.join(__dirname, '../uploads/images/category/', category.image)
            }                                    
            
            result = await CategoryRepo.Delete(category.toJSON())
            
            // ဖိုင်တကယ်ရှိမှ ကွက်တိ ဖြုတ်ထုတ်မည်
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath)
            }
        } else {
            result.success = false
            result.message = "Category not found."
        }
    }
    res.json(result)
}

// Save/Update အပိုင်း (500 Error တက်စေသော လိုင်းအား ပြင်ဆင်ထားပါသည်)
exports.save = async (req, res) => {
    var category = req.body

    // ပုံအသစ် တင်လာခဲ့လျှင် ထည့်သွင်းမည်
    if (req.file) {
        category.image = req.file.filename        
    }

    var oldCategoryImagePath = null;
    var shouldDeleteOldImage = false;

    if (category.id > 0) {
        var oldCategory = await CategoryRepo.GetById(category.id)    
        if (oldCategory) {
            // ပုံဟောင်းလည်းရှိ၊ ပုံအသစ်လည်း အမှန်တကယ် ပြောင်းလဲတင်လာမှသာ ပုံဟောင်းဖျက်ရန် ပြင်ဆင်မည်
            if (oldCategory.image && req.file) {
                oldCategoryImagePath = path.join(__dirname, '../uploads/images/category/', oldCategory.image)
                shouldDeleteOldImage = true;
            } 
            // ပုံအသစ် မပါလာလျှင် မူရင်းပုံဟောင်းကို ထိန်းထားမည်
            else if (!req.file) {
                category.image = oldCategory.image;
            }
        }
    }
     
    var result = await CategoryRepo.SaveOrUpdate(category)

    // သတ်မှတ်ချက်အားလုံး ကိုက်ညီပြီး ဖိုင်တကယ်ရှိမှသာ ဖျက်မည်
    if (shouldDeleteOldImage && oldCategoryImagePath && fs.existsSync(oldCategoryImagePath)) {
        fs.unlinkSync(oldCategoryImagePath)
    }

    res.json(result)
}