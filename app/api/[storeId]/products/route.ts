import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// !! req kullanılmasada eklenmesi zorunlu -- ilk arguman olmak zorunda !!
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { 
      name,
      price,
      categoryId,
      colorId,
      sizeId,
      Images,
      isFeatured,
      isArchived
     } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!name || !Images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    if (!sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
        where: {
            id : params.storeId,
            userId
        }
    });

    if(!storeByUserId){
        return new NextResponse('Unauthorized',{status: 403})
    }

    // ayni ismi vermek onemli Images
    const product = await prismadb.product.create({
      data: {
        storeId: params.storeId,
        name,
        isFeatured,
        isArchived,
        price,
        categoryId,
        colorId,
        sizeId,
        Images :{
          createMany : {
            data : [
              ...Images.map((image : {url : string}) => image)
            ]
          }
        }
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_POST]", error);
    return new NextResponse("Interval error", { status: 500 });
  }
}

// !! req kullanılmasada eklenmesi zorunlu -- ilk arguman olmak zorunda !!
export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const {searchParams} = new URL(req.url);

    const categoryId = searchParams.get('categoryId') || undefined;
    const colorId = searchParams.get('colorId') || undefined;
    const sizeId = searchParams.get('sizeId') || undefined;
    const isFeatured = searchParams.get('isFeatured');


    if (!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
    }

    // varsa filtereleyip getirir yoksa hic yokmus gibi davranir
    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived : false
      },
      include : {
        Images : true,
        category : true,
        color : true,
        size : true
      },
      orderBy: {
        createdAt : 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
