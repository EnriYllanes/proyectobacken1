import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'; // se importa el plugin de paginación

const ProductSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // se asegura que el código sea único
    price: { type: Number, required: true },
    status: { type: Boolean, default: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true, index: true }, // se agrega un índice para búsquedas rápidas por categoría
    thumbnails: { type: [String], default: [] }
}, 
{
    // Opciones del esquema: se habilita timestamps para tener registro de creación/actualización
    timestamps: true,
});

// 📌 Aplicar el plugin de paginación al esquema
ProductSchema.plugin(mongoosePaginate);

const ProductModel = model('Product', ProductSchema, 'products');

export default ProductModel;