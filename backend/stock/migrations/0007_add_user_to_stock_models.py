from django.db import migrations, models
import django.db.models.deletion


def backfill_user(apps, schema_editor):
    User = apps.get_model('users', 'User')
    owner = User.objects.order_by('id').first()
    if owner is None:
        return
    for model_name in ('PotentialStock', 'StockIn', 'StockOut', 'TotalStock'):
        model_cls = apps.get_model('stock', model_name)
        model_cls.objects.filter(user__isnull=True).update(user_id=owner.pk)


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0006_alter_stockin_quantity_alter_stockin_total_quantity_and_more'),
        ('users', '0002_alter_user_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='potentialstock',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='potential_stocks', to='users.user'),
        ),
        migrations.AddField(
            model_name='stockin',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='stock_in_records', to='users.user'),
        ),
        migrations.AddField(
            model_name='stockout',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='stock_out_records', to='users.user'),
        ),
        migrations.AddField(
            model_name='totalstock',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='total_stock_records', to='users.user'),
        ),
        migrations.RunPython(backfill_user, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='potentialstock',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='potential_stocks', to='users.user'),
        ),
        migrations.AlterField(
            model_name='stockin',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stock_in_records', to='users.user'),
        ),
        migrations.AlterField(
            model_name='stockout',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stock_out_records', to='users.user'),
        ),
        migrations.AlterField(
            model_name='totalstock',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='total_stock_records', to='users.user'),
        ),
    ]