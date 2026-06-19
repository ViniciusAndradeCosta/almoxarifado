import prisma from "../../database/client.js";
import { registrarSaida, validarDataSaida } from "../../services/stockService.js";
async function giveItem(req, res) {
    const { employeeId, itemId, quantity, withdrawalDate, origemPeca } = req.body;

    try {
        const result = await registrarSaida({ employeeId, itemId, quantity, withdrawalDate, origemPeca });
        return res.json({
            success: true,
            withdrawal: result.withdrawal,
            allWithdrawal: result.allWithdrawal,
            message: "Saída registrada com sucesso (estoque atualizado de forma transacional).",
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            success: false,
            error: error.message || "Erro ao processar saída.",
        });
    }
}

async function returnItem(req, res) {
    const { id } = req.params;

    try {
        const item = await prisma.withdrawal.delete({
            where: {
                id: parseInt(id)
            }
        });

        res.json(item);
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function returnItemAndAddQuantity(req, res) {
    const { id } = req.params;
    const { quantityToReturn, destino } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const item = await tx.withdrawal.findUnique({
                where: { id: parseInt(id) },
                include: { item: true, employee: true }
            });

            if (!item) {
                throw new Error("Registro de saída não encontrado.");
            }

            const qty = quantityToReturn ? Number(quantityToReturn) : item.quantity;

            if (qty > item.quantity) {
                throw new Error("A quantidade de devolução não pode ser maior que a retirada original.");
            }

            // 1. Devolve a quantidade respectiva ao estoque,
            // incrementando tanto o total quanto o contador de devolvidas
            await tx.item.update({
                where: { id: item.itemId },
                data: {
                    quantity: { increment: qty },
                    quantityReturned: { increment: qty }
                }
            });

            // 2. CRIA O REGISTRO NO HISTÓRICO COM A ETIQUETA CORRETA
            await tx.allWithdrawal.create({
                data: {
                    idWithdrawal: item.id,
                    withdrawalDate: new Date(),
                    itemId: item.itemId,
                    itemName: item.item.name,
                    itemType: item.item.type,
                    itemSector: item.item.sector,
                    itemSize: item.item.size,
                    itemEan: item.item.ean,
                    quantity: qty,
                    employeeName: item.employee.name,
                    employeeId: item.employee.id,
                    employeeRole: item.employee.role,
                    employeeCompany: item.employee.company,
                    employeeDepartment: item.employee.department,
                    tipoMovimento: destino === "DESCARTE" ? "DEVOLUCAO_DESCARTE" : "DEVOLUCAO_ESTOQUE"
                }
            });

            // 3. Atualiza ou deleta a saída da "Ficha" do funcionário
            let updatedWithdrawal;
            if (qty >= item.quantity) {
                updatedWithdrawal = await tx.withdrawal.delete({
                    where: { id: parseInt(id) }
                });
            } else {
                updatedWithdrawal = await tx.withdrawal.update({
                    where: { id: parseInt(id) },
                    data: { quantity: item.quantity - qty }
                });
            }

            return updatedWithdrawal;
        });

        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getItensOut(req, res) {
    const { id } = req.params;

    try {
        const itensOut = await prisma.withdrawal.findMany({
            where: {
                employeeId: parseInt(id)
            },
            include: {
                item: {
                    select: {
                        id: true,
                        name: true,
                        size: true,
                        type: true
                    }
                }
            }
        });

        res.json(itensOut);
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function getWithdrawals(req, res) {
    try {
        const withdrawals = await prisma.withdrawal.findMany();
        res.json(withdrawals);
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function getWithdrawalsOut(req, res) {
    try {
        const withdrawals = await prisma.withdrawal.findMany({
            include: {
                item: { select: { name: true } },
                employee: { select: { name: true } }
            }
        });
        res.json(withdrawals);
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function getWithdrawalsOutPlus(req, res) {
    try {
        const withdrawals = await prisma.withdrawal.findMany({
            include: {
                item: { select: { name: true, sector: true, type: true } },
                employee: { select: { name: true, department: true } }
            }
        });
        res.json(withdrawals);
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function updateWithdrawal(req, res) {
    const { id } = req.params;
    const { quantity, withdrawalDate } = req.body;

    try {
        validarDataSaida(withdrawalDate);
        if (quantity !== undefined && (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0)) {
            return res.status(400).json({ error: "Quantidade inválida." });
        }
        const result = await prisma.$transaction(async (tx) => {
            const withdrawal = await tx.withdrawal.update({
                where: { id: parseInt(id) },
                data: {
                    quantity: quantity !== undefined ? Number(quantity) : undefined,
                    withdrawalDate: withdrawalDate ? new Date(withdrawalDate) : undefined,
                },
            });
            const allWithdrawal = await tx.allWithdrawal.updateMany({
                where: { idWithdrawal: parseInt(id) },
                data: {
                    quantity: quantity !== undefined ? Number(quantity) : undefined,
                    withdrawalDate: withdrawalDate ? new Date(withdrawalDate) : undefined,
                },
            });
            return { withdrawal, allWithdrawal };
        });

        return res.json({
            allWithdrawal: result.allWithdrawal,
            updatedAllWithdrawalCount: result.allWithdrawal.count,
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({ error: error.message });
    }
}

async function getItemOut(req, res) {
    const { id } = req.params;
    try {
        const itemOut = await prisma.withdrawal.findUnique({
            where: { id: parseInt(id) },
            include: { item: { select: { name: true } } }
        });
        res.json(itemOut);
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function getAllWithdrawals(req, res) {
    try {
        const allWithdrawal = await prisma.allWithdrawal.findMany({
            orderBy: { withdrawalDate: 'desc' }
        });
        res.json(allWithdrawal);
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function createWithdrawal(req, res) {
    const { idWithdrawal, withdrawalDate, itemId, itemName, itemType, itemSector, itemSize, itemEan, quantity, employeeName, employeeId, employeeRole, employeeCompany, employeeDepartment } = req.body;

    try {
        const newWithdrawal = await prisma.allWithdrawal.create({
            data: {
                idWithdrawal: Number(idWithdrawal),
                withdrawalDate: withdrawalDate,
                itemId: Number(itemId),
                itemName,
                itemType,
                itemSector,
                itemSize: itemSize || null,
                itemEan: itemEan || null,
                quantity: Number(quantity),
                employeeName,
                employeeId: Number(employeeId),
                employeeRole,
                employeeCompany,
                employeeDepartment,
            },
        });
        return res.status(201).json(newWithdrawal);
    } catch (error) {
        res.json({ error: error.message });
    }
}

async function getWithdrawalsByItem(req, res) {
    const { itemId } = req.params;
    try {
        const withdrawals = await prisma.withdrawal.findMany({
            where: { itemId: parseInt(itemId) },
            include: {
                item: { select: { name: true, sector: true, type: true } },
                employee: { select: { name: true, department: true } }
            },
            orderBy: { withdrawalDate: 'desc' }
        });
        res.json(withdrawals);
    } catch (error) {
        res.json({ error: error.message });
    }
}

async function deleteItemWithWithdrawals(req, res) {
    const { itemId } = req.params;
    try {
        const id = parseInt(itemId);
        await prisma.$transaction(async (tx) => {
            await tx.stockEntry.deleteMany({ where: { itemId: id } });
            await tx.discardedItem.deleteMany({ where: { itemId: id } });
            await tx.laundryRecord.deleteMany({ where: { itemId: id } });
            await tx.withdrawal.deleteMany({ where: { itemId: id } });
            await tx.orderItem.updateMany({
                where: { itemId: id },
                data: { itemId: null },
            });
            await tx.item.delete({ where: { id: id } });
        });
        res.json({ success: true, message: 'Item e todos os registros relacionados foram deletados.' });
    } catch (error) {
        console.error('Erro ao deletar item:', error);
        res.status(500).json({ error: error.message });
    }
}

async function testAllWithdrawal(req, res) {
    try {
        const testData = {
            idWithdrawal: 1, withdrawalDate: new Date(), itemId: 1, itemName: 'TESTE', itemType: 'TESTE', itemSector: 'TESTE', itemSize: null, itemEan: null, quantity: 1, employeeName: 'TESTE', employeeId: 1, employeeRole: 'TESTE', employeeCompany: 'TESTE', employeeDepartment: 'TESTE'
        };
        const result = await prisma.allWithdrawal.create({ data: testData });
        await prisma.allWithdrawal.delete({ where: { id: result.id } });
        res.json({ success: true, message: 'Tabela AllWithdrawal está funcionando corretamente', testResult: result });
    } catch (error) {
        res.json({ success: false, error: error.message, details: error });
    }
}

async function deleteAllWithdrawal(req, res) {
    const { id } = req.params;
    try {
        const allWithdrawal = await prisma.allWithdrawal.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: 'Registro excluído com sucesso' });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

// GET /getreturnstats — retorna contagem de devoluções por item (para badge no Estoque)
async function getReturnStats(req, res) {
    try {
        const stats = await prisma.allWithdrawal.groupBy({
            by: ['itemId', 'tipoMovimento'],
            where: { tipoMovimento: { in: ['DEVOLUCAO_ESTOQUE', 'DEVOLUCAO_DESCARTE'] } },
            _sum: { quantity: true },
        });

        // Agrupa por itemId
        const resultado = {};
        stats.forEach(s => {
            if (!resultado[s.itemId]) resultado[s.itemId] = { devolvidoEstoque: 0, devolvidoDescarte: 0 };
            if (s.tipoMovimento === 'DEVOLUCAO_ESTOQUE') resultado[s.itemId].devolvidoEstoque = s._sum.quantity || 0;
            if (s.tipoMovimento === 'DEVOLUCAO_DESCARTE') resultado[s.itemId].devolvidoDescarte = s._sum.quantity || 0;
        });

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export {
    getItensOut,
    giveItem,
    returnItem,
    returnItemAndAddQuantity,
    getWithdrawals,
    getWithdrawalsOut,
    updateWithdrawal,
    getItemOut,
    getWithdrawalsOutPlus,
    getAllWithdrawals,
    createWithdrawal,
    getWithdrawalsByItem,
    deleteItemWithWithdrawals,
    testAllWithdrawal,
    deleteAllWithdrawal,
    getReturnStats
};