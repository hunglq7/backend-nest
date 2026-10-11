import { Entity } from "typeorm";
import { CatalogEntity } from "./catalog.entity";

@Entity("loai_bao_tris")
export class LoaiBaoTri extends CatalogEntity {}
