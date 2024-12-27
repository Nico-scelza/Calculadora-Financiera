def calculadora_financiera():
    print("Bienvenido a la calculadora financiera")
    print("Elija una de las siguientes opciones:")
    print("1. Régimen Simple")
    print("2. Régimen Compuesto")
    print("3. Equivalencia de Tasas")
    print("4. Rentas Valor Final")
    print("5. Rentas Valor Actual")
    print("6. Sistemas de Amortización")
    while True:
        eleccion = int(input("Inserte la opción elegida: "))
        if 1 <= eleccion <= 6:
            break
        else:
            print("Inserte una opción válida")
    if eleccion == 1:
        import Operaciones.regimen_simple as RS
        Regimen_Simple = RS.regimen_simple()
        return Regimen_Simple
    elif eleccion == 2:
        import Operaciones.regimen_compuesto as RC
        Regimen_Compuesto = RC.regimen_compuesto()
        return Regimen_Compuesto 
    elif eleccion == 3:
        import Operaciones.equivalencias as E
        Equivalencias = E.equivalencias()
        return Equivalencias
    elif eleccion == 4:
        import Operaciones.rentas_valor_final as VF
        Rentas_Valor_Final = VF.rentas_valor_final()
        return Rentas_Valor_Final
    elif eleccion == 5:
        import Operaciones.rentas_valor_actual as VA
        Rentas_Valor_Actual = VA.rentas_valor_actual()
        return Rentas_Valor_Actual
    elif eleccion == 6:
        print("Elija uno de los siguientes sistemas de amortización")
        print("1. Francés")
        print("2. Aleman")
        print("3. Americano")
        while True:
            eleccion1 = int(input("Inserte la opción elegida: "))
            if 1 <= eleccion1 <= 3:
                break
            else:
                print("Inserte una opción válida")
        if eleccion1 == 1:
            import Operaciones.sistema_frances as SF
            Sistema_Frances = SF.sistema_frances()
            return Sistema_Frances
        elif eleccion1 == 2:
            import Operaciones.sistema_aleman as SA
            Sistema_Aleman = SA.sistema_aleman()
            return Sistema_Aleman
        elif eleccion1 == 3:
            import Operaciones.sistema_americano as SAA
            Sistema_Americano = SAA.sistema_americano()
            return Sistema_Americano
        else:
            print("Inserte una opción válida")
    else:
        print("Inserte una opción válida")

print(calculadora_financiera())